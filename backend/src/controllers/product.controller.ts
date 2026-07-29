import type { Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { productSchema } from "../utils/catalog.schemas";
import {
  idParamsSchema,
  paginated,
  pagination,
  validationError,
} from "../utils/http";

export const listProducts = async (req: Request, res: Response) => {
  const { page, limit, skip } = pagination(req);
  const search =
    typeof req.query.search === "string" ? req.query.search : undefined;
  const where = {
    ...(req.query.admin === "true" ? {} : { status: "ACTIVE" as const }),
    ...(req.query.category
      ? { category: { slug: String(req.query.category) } }
      : {}),
    ...(req.query.audience
      ? {
          audience: String(req.query.audience) as
            "WOMEN" | "MEN" | "UNISEX" | "KIDS",
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
      orderBy: [{ isFeatured: "desc" }, { createdAt: "desc" }],
    }),
    prisma.product.count({ where }),
  ]);
  return res.json(paginated(products, total, page, limit));
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
  const parsed = productSchema.safeParse(req.body);
  if (!parsed.success) return validationError(res, parsed.error);
  const product = await prisma.product.create({ data: parsed.data });
  return res.status(201).json({ success: true, product });
};

export const updateProduct = async (req: Request, res: Response) => {
  const { id } = idParamsSchema.parse(req.params);
  const parsed = productSchema.partial().safeParse(req.body);
  if (!parsed.success) return validationError(res, parsed.error);
  const product = await prisma.product.update({
    where: { id },
    data: parsed.data,
  });
  return res.json({ success: true, product });
};

export const deleteProduct = async (req: Request, res: Response) => {
  const { id } = idParamsSchema.parse(req.params);
  await prisma.product.update({
    where: { id },
    data: { status: "ARCHIVED", publishedAt: null },
  });
  return res.status(204).send();
};
