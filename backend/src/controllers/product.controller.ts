import type { Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { productSchema } from "../utils/catalog.schemas";
import {
  idParamsSchema,
  paginated,
  pagination,
  validationError,
} from "../utils/http";
import { memoryCache } from "../utils/cache";
import { getCache, setCache, delCache } from "../utils/redis";

export const listProducts = async (req: Request, res: Response) => {
  const isAdmin = req.query.admin === "true";
  const { page, limit, skip } = pagination(req);
  const search =
    typeof req.query.search === "string" ? req.query.search : undefined;
  const category = req.query.category ? String(req.query.category) : undefined;
  const audience = req.query.audience ? String(req.query.audience) : undefined;

  const cacheKey = `products:${isAdmin ? "admin" : "public"}:${page}:${limit}:${search || ""}:${category || ""}:${audience || ""}`;

  if (!isAdmin) {
    res.setHeader(
      "Cache-Control",
      "public, max-age=30, s-maxage=120, stale-while-revalidate=300",
    );
    const memCached = memoryCache.get(cacheKey);
    if (memCached) {
      return res.json(memCached);
    }

    const redisCached = await getCache(cacheKey);
    if (redisCached) {
      memoryCache.set(cacheKey, redisCached, 60);
      return res.json(redisCached);
    }
  }

  const where = {
    ...(isAdmin
      ? { status: { not: "ARCHIVED" as const } }
      : { status: "ACTIVE" as const }),
    ...(category ? { category: { slug: category } } : {}),
    ...(audience
      ? {
          audience: audience as "WOMEN" | "MEN" | "UNISEX" | "KIDS",
        }
      : {}),
    ...(search
      ? {
          OR: [
            { name: { contains: search, mode: "insensitive" as const } },
            { description: { contains: search, mode: "insensitive" as const } },
            { sku: { contains: search, mode: "insensitive" as const } },
          ],
        }
      : {}),
  };
  const [products, total] = await prisma.$transaction([
    prisma.product.findMany({
      where,
      skip,
      take: limit,
      include: {
        brand: true,
        category: true,
        images: { orderBy: { sortOrder: "asc" } },
        variants: { include: { inventory: true } },
        _count: { select: { reviews: true } },
      },
      orderBy: isAdmin
        ? [{ createdAt: "desc" }]
        : [{ isFeatured: "desc" }, { createdAt: "desc" }],
    }),
    prisma.product.count({ where }),
  ]);

  const result = paginated(products, total, page, limit);
  if (!isAdmin) {
    memoryCache.set(cacheKey, result, 60);
    setCache(cacheKey, result, 120).catch(() => {});
  }

  return res.json(result);
};

export const getProduct = async (req: Request, res: Response) => {
  const identifier = String(req.params.id);
  const product = await prisma.product.findFirst({
    where: { OR: [{ id: identifier }, { slug: identifier }] },
    include: {
      brand: true,
      category: true,
      images: { orderBy: { sortOrder: "asc" } },
      details: { orderBy: { sortOrder: "asc" } },
      options: {
        orderBy: { sortOrder: "asc" },
        include: { values: { orderBy: { sortOrder: "asc" } } },
      },
      variants: {
        include: {
          inventory: true,
          optionValues: { include: { optionValue: true } },
        },
      },
    },
  });
  if (!product) {
    return res
      .status(404)
      .json({ success: false, message: "Product not found" });
  }
  const ratingSummary = await prisma.review.aggregate({
    where: { productId: product.id, status: "APPROVED" },
    _avg: { rating: true },
    _count: { rating: true },
  });

  const price = Number(product.price);
  const candidates = await prisma.product.findMany({
    where: {
      id: { not: product.id },
      status: "ACTIVE",
      OR: [
        ...(product.categoryId ? [{ categoryId: product.categoryId }] : []),
        { audience: product.audience },
        ...(product.brandId ? [{ brandId: product.brandId }] : []),
        ...(Number.isFinite(price) && price > 0
          ? [{ price: { gte: price * 0.7, lte: price * 1.3 } }]
          : []),
      ],
    },
    include: {
      brand: true,
      category: true,
      images: { orderBy: { sortOrder: "asc" } },
      _count: { select: { reviews: true } },
    },
    take: 24,
  });

  const related = candidates
    .map((candidate) => {
      const candidatePrice = Number(candidate.price);
      let score = 0;
      if (candidate.categoryId && candidate.categoryId === product.categoryId) {
        score += 3;
      }
      if (candidate.audience === product.audience) score += 2;
      if (candidate.brandId && candidate.brandId === product.brandId) score += 1;
      if (
        Number.isFinite(price) &&
        Number.isFinite(candidatePrice) &&
        price > 0 &&
        candidatePrice >= price * 0.7 &&
        candidatePrice <= price * 1.3
      ) {
        score += 1;
      }
      if (candidate.isFeatured) score += 0.5;
      const priceDiff =
        Number.isFinite(price) && Number.isFinite(candidatePrice)
          ? Math.abs(candidatePrice - price)
          : Infinity;
      return { candidate, score, priceDiff };
    })
    .sort((a, b) => b.score - a.score || a.priceDiff - b.priceDiff)
    .slice(0, 4)
    .map(({ candidate }) => candidate);

  return res.json({
    success: true,
    product: {
      ...product,
      rating: ratingSummary._avg.rating ?? 0,
      reviewCount: ratingSummary._count.rating,
      related,
    },
  });
};

export const createProduct = async (req: Request, res: Response) => {
  const { categoryName, category, imageUrl, image, images, brandName, ...bodyData } = req.body;

  let brandId = bodyData.brandId;
  if (!brandId) {
    const defaultBrand = await prisma.brand.findFirst();
    if (defaultBrand) brandId = defaultBrand.id;
  }

  const parsed = productSchema.safeParse({
    ...bodyData,
    ...(brandId ? { brandId } : {}),
  });
  if (!parsed.success) return validationError(res, parsed.error);

  const imageList = images?.length
    ? images
    : imageUrl || image
      ? [imageUrl || image]
      : [];

  const product = await prisma.$transaction(async (tx) => {
    let finalCatId = parsed.data.categoryId;
    if (!finalCatId && (categoryName || category)) {
      const catName = categoryName || category;
      const catSlug = String(catName).toLowerCase().replace(/[^a-z0-9]+/g, "-");
      let cat = await tx.category.findFirst({
        where: { OR: [{ slug: catSlug }, { name: String(catName) }] },
      });
      if (!cat) {
        cat = await tx.category.create({
          data: { name: String(catName), slug: catSlug },
        });
      }
      finalCatId = cat.id;
    }

    const createdProduct = await tx.product.create({
      data: {
        ...parsed.data,
        ...(finalCatId ? { categoryId: finalCatId } : {}),
      },
    });

    if (imageList.length) {
      await tx.productImage.createMany({
        data: imageList.map((url: string, i: number) => ({
          productId: createdProduct.id,
          url,
          altText: createdProduct.name,
          sortOrder: i,
          isPrimary: i === 0,
        })),
      });
    }

    return createdProduct;
  });

  memoryCache.del("products:");
  delCache("products:*").catch(() => {});
  return res.status(201).json({ success: true, product });
};

export const updateProduct = async (req: Request, res: Response) => {
  const { id } = idParamsSchema.parse(req.params);
  const { categoryName, category, imageUrl, image, images, brandName, ...bodyData } = req.body;

  const parsed = productSchema.partial().safeParse(bodyData);
  if (!parsed.success) return validationError(res, parsed.error);

  const imageList = images?.length
    ? images
    : imageUrl || image
      ? [imageUrl || image]
      : null;

  const product = await prisma.$transaction(async (tx) => {
    let finalCatId = parsed.data.categoryId;
    if (!finalCatId && (categoryName || category)) {
      const catName = categoryName || category;
      const catSlug = String(catName).toLowerCase().replace(/[^a-z0-9]+/g, "-");
      let cat = await tx.category.findFirst({
        where: { OR: [{ slug: catSlug }, { name: String(catName) }] },
      });
      if (!cat) {
        cat = await tx.category.create({
          data: { name: String(catName), slug: catSlug },
        });
      }
      finalCatId = cat.id;
    }

    const updatedProduct = await tx.product.update({
      where: { id },
      data: {
        ...parsed.data,
        ...(finalCatId ? { categoryId: finalCatId } : {}),
      },
    });

    if (imageList) {
      await tx.productImage.deleteMany({
        where: { productId: updatedProduct.id },
      });
      await tx.productImage.createMany({
        data: imageList.map((url: string, i: number) => ({
          productId: updatedProduct.id,
          url,
          altText: updatedProduct.name,
          sortOrder: i,
          isPrimary: i === 0,
        })),
      });
    }

    return updatedProduct;
  });

  memoryCache.del("products:");
  delCache("products:*").catch(() => {});
  return res.json({ success: true, product });
};

export const deleteProduct = async (req: Request, res: Response) => {
  const { id } = idParamsSchema.parse(req.params);
  await prisma.product.update({
    where: { id },
    data: { status: "ARCHIVED", publishedAt: null },
  });
  memoryCache.del("products:");
  delCache("products:*").catch(() => {});
  return res.status(204).send();
};
