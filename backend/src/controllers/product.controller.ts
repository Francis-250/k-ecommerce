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
    ...(isAdmin ? {} : { status: "ACTIVE" as const }),
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
        images: { orderBy: { sortOrder: "asc" }, take: 1 },
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
  return res.json({
    success: true,
    product: {
      ...product,
      rating: ratingSummary._avg.rating ?? 0,
      reviewCount: ratingSummary._count.rating,
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

  const primaryImage = imageUrl || image || images?.[0];

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

    if (primaryImage) {
      await tx.productImage.create({
        data: {
          productId: createdProduct.id,
          url: primaryImage,
          altText: createdProduct.name,
          isPrimary: true,
        },
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

  const primaryImage = imageUrl || image || images?.[0];

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

    if (primaryImage) {
      const existingImg = await tx.productImage.findFirst({
        where: { productId: updatedProduct.id },
      });
      if (existingImg) {
        await tx.productImage.update({
          where: { id: existingImg.id },
          data: { url: primaryImage },
        });
      } else {
        await tx.productImage.create({
          data: {
            productId: updatedProduct.id,
            url: primaryImage,
            altText: updatedProduct.name,
            isPrimary: true,
          },
        });
      }
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
