import type { Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { brandSchema } from "../utils/catalog.schemas";
import { idParamsSchema, validationError } from "../utils/http";
import { memoryCache } from "../utils/cache";
import { getCache, setCache, delCache } from "../utils/redis";

export const listBrands = async (req: Request, res: Response) => {
  const isAdmin = req.query.admin === "true";
  const cacheKey = `brands:${isAdmin ? "admin" : "public"}`;

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

  const brands = await prisma.brand.findMany({
    where: isAdmin ? undefined : { isActive: true },
    orderBy: { name: "asc" },
  });

  const result = { success: true, brands };
  if (!isAdmin) {
    memoryCache.set(cacheKey, result, 120);
    setCache(cacheKey, result, 600).catch(() => {});
  }

  return res.json(result);
};

export const createBrand = async (req: Request, res: Response) => {
  const parsed = brandSchema.safeParse(req.body);
  if (!parsed.success) return validationError(res, parsed.error);
  const brand = await prisma.brand.create({ data: parsed.data });
  memoryCache.del("brands:");
  delCache("brands:*").catch(() => {});
  return res.status(201).json({ success: true, brand });
};

export const updateBrand = async (req: Request, res: Response) => {
  const { id } = idParamsSchema.parse(req.params);
  const parsed = brandSchema.partial().safeParse(req.body);
  if (!parsed.success) return validationError(res, parsed.error);
  const brand = await prisma.brand.update({ where: { id }, data: parsed.data });
  memoryCache.del("brands:");
  delCache("brands:*").catch(() => {});
  return res.json({ success: true, brand });
};

export const deleteBrand = async (req: Request, res: Response) => {
  const { id } = idParamsSchema.parse(req.params);
  await prisma.brand.delete({ where: { id } });
  memoryCache.del("brands:");
  delCache("brands:*").catch(() => {});
  return res.status(204).send();
};
