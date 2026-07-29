import type { Request, Response } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { cloudinaryUrlSchema, validationError } from "../utils/http";

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

  return res.json({ success: true, appearance: parsed.data });
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

  return res.json({
    success: true,
    appearance: setting.value,
  });
};

const schema = z.object({
  key: z.string().min(1).max(120),
  value: z.unknown(),
});
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
  return res.json({ success: true, setting });
};
export const deleteStoreSetting = async (req: Request, res: Response) => {
  await prisma.storeSetting.delete({ where: { key: String(req.params.key) } });
  return res.status(204).send();
};
