import type { Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { categorySchema } from "../utils/catalog.schemas";
import { idParamsSchema, validationError } from "../utils/http";
import { memoryCache } from "../utils/cache";
import { getCache, setCache, delCache } from "../utils/redis";

export const listCategories = async (req: Request, res: Response) => {
  const isAdmin = req.query.admin === "true";
  const cacheKey = `categories:${isAdmin ? "admin" : "public"}`;

  if (!isAdmin) {
    res.setHeader(
      "Cache-Control",
      "public, max-age=120, s-maxage=600, stale-while-revalidate=1200",
    );
    const memCached = memoryCache.get(cacheKey);
    if (memCached) return res.json(memCached);

    const redisCached = await getCache(cacheKey);
    if (redisCached) {
      memoryCache.set(cacheKey, redisCached, 120);
      return res.json(redisCached);
    }
  }

  const categories = await prisma.category.findMany({
    where: isAdmin ? undefined : { isActive: true },
    include: { children: true, _count: { select: { products: true } } },
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
  });

  const result = { success: true, categories };
  if (!isAdmin) {
    memoryCache.set(cacheKey, result, 120);
    setCache(cacheKey, result, 600).catch(() => {});
  }

  return res.json(result);
};

export const createCategory = async (req: Request, res: Response) => {
  const parsed = categorySchema.safeParse(req.body);
  if (!parsed.success) return validationError(res, parsed.error);
  const category = await prisma.category.create({ data: parsed.data });
  memoryCache.del("categories:");
  delCache("categories:*").catch(() => {});
  return res.status(201).json({ success: true, category });
};

export const updateCategory = async (req: Request, res: Response) => {
  const { id } = idParamsSchema.parse(req.params);
  const parsed = categorySchema.partial().safeParse(req.body);
  if (!parsed.success) return validationError(res, parsed.error);
  const category = await prisma.category.update({
    where: { id },
    data: parsed.data,
  });
  memoryCache.del("categories:");
  delCache("categories:*").catch(() => {});
  return res.json({ success: true, category });
};

export const deleteCategory = async (req: Request, res: Response) => {
  const { id } = idParamsSchema.parse(req.params);
  await prisma.category.delete({ where: { id } });
  memoryCache.del("categories:");
  delCache("categories:*").catch(() => {});
  return res.status(204).send();
};
