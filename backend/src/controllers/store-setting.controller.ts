import type { Request, Response } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { cloudinaryUrlSchema, validationError } from "../utils/http";
import { memoryCache } from "../utils/cache";
import { getCache, setCache, delCache } from "../utils/redis";

const imageSchema = z.object({
  url: cloudinaryUrlSchema,
  alt: z.string().trim().min(1).max(200),
});

export const storefrontAppearanceSchema = z.object({
  logo: imageSchema,
  hero: imageSchema.extend({
    eyebrow: z.string().trim().max(120),
    title: z.string().trim().min(1).max(120),
    description: z.string().trim().max(300),
    link: z.string().trim().startsWith("/"),
    linkLabel: z.string().trim().min(1).max(80),
  }),
  promotions: z
    .array(
      imageSchema.extend({
        link: z.string().trim().startsWith("/"),
        label: z.string().trim().max(100),
      }),
    )
    .length(2),
  sidebar: z.object({
    top: imageSchema,
    middle: imageSchema,
    bottom: imageSchema,
  }),
  shopBanner: imageSchema,
});

export const getStorefrontAppearance = async (_req: Request, res: Response) => {
  res.setHeader(
    "Cache-Control",
    "public, max-age=300, s-maxage=1800, stale-while-revalidate=3600",
  );

  const cacheKey = "storefront:appearance";
  const memCached = memoryCache.get(cacheKey);
  if (memCached) return res.json(memCached);

  const redisCached = await getCache(cacheKey);
  if (redisCached) {
    memoryCache.set(cacheKey, redisCached, 300);
    return res.json(redisCached);
  }

  const setting = await prisma.storeSetting.findUnique({
    where: { key: "storefront.appearance" },
  });

  if (!setting) {
    return res.status(404).json({
      success: false,
      message: "Storefront appearance has not been configured",
    });
  }

  const parsed = storefrontAppearanceSchema.safeParse(setting.value);
  if (!parsed.success) {
    return res.status(500).json({
      success: false,
      message: "Storefront appearance configuration is invalid",
    });
  }

  const result = { success: true, appearance: parsed.data };
  memoryCache.set(cacheKey, result, 300);
  setCache(cacheKey, result, 1800).catch(() => {});

  return res.json(result);
};

export const updateStorefrontAppearance = async (
  req: Request,
  res: Response,
) => {
  const parsed = storefrontAppearanceSchema.safeParse(req.body);
  if (!parsed.success) return validationError(res, parsed.error);

  const setting = await prisma.storeSetting.upsert({
    where: { key: "storefront.appearance" },
    update: { value: parsed.data, updatedBy: req.auth!.sub },
    create: {
      key: "storefront.appearance",
      value: parsed.data,
      updatedBy: req.auth!.sub,
    },
  });

  memoryCache.del("storefront:appearance");
  delCache("storefront:appearance").catch(() => {});

  return res.json({
    success: true,
    appearance: setting.value,
  });
};

const schema = z.object({
  key: z.string().min(1).max(120),
  value: z.unknown(),
});
export const getStoreSettingByKey = async (req: Request, res: Response) => {
  const key = String(req.params.key);
  const setting = await prisma.storeSetting.findUnique({
    where: { key },
  });
  if (!setting) {
    return res.status(404).json({
      success: false,
      message: `Setting '${key}' not found`,
    });
  }
  return res.json({ success: true, setting });
};

export const listStoreSettings = async (_req: Request, res: Response) =>
  res.json({
    success: true,
    settings: await prisma.storeSetting.findMany({ orderBy: { key: "asc" } }),
  });

export const upsertStoreSetting = async (req: Request, res: Response) => {
  const p = schema.safeParse({
    ...req.body,
    key: req.params.key ?? req.body.key,
  });
  if (!p.success) return validationError(res, p.error);
  const setting = await prisma.storeSetting.upsert({
    where: { key: p.data.key },
    update: { value: p.data.value as never, updatedBy: req.auth!.sub },
    create: {
      key: p.data.key,
      value: p.data.value as never,
      updatedBy: req.auth!.sub,
    },
  });

  if (p.data.key === "storefront.appearance") {
    memoryCache.del("storefront:appearance");
    delCache("storefront:appearance").catch(() => {});
  }

  return res.json({ success: true, setting });
};

export const deleteStoreSetting = async (req: Request, res: Response) => {
  const key = String(req.params.key);
  await prisma.storeSetting.delete({ where: { key } });
  if (key === "storefront.appearance") {
    memoryCache.del("storefront:appearance");
    delCache("storefront:appearance").catch(() => {});
  }
  return res.status(204).send();
};
