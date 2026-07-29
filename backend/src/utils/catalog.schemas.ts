import { z } from "zod";
import { cloudinaryUrlSchema } from "./http";

export const brandSchema = z.object({
  name: z.string().trim().min(2).max(120),
  slug: z.string().trim().min(2).max(140),
  description: z.string().trim().max(2000).nullable().optional(),
  logoUrl: cloudinaryUrlSchema.nullable().optional(),
  websiteUrl: z.string().url().nullable().optional(),
  country: z.string().trim().max(100).nullable().optional(),
  isActive: z.boolean().optional(),
});

export const categorySchema = z.object({
  parentId: z.string().nullable().optional(),
  name: z.string().trim().min(2).max(120),
  slug: z.string().trim().min(2).max(140),
  description: z.string().trim().max(2000).nullable().optional(),
  imageUrl: cloudinaryUrlSchema.nullable().optional(),
  isActive: z.boolean().optional(),
  sortOrder: z.number().int().min(0).optional(),
});

export const productSchema = z.object({
  categoryId: z.string().nullable().optional(),
  brandId: z.string().nullable().optional(),
  name: z.string().trim().min(2).max(200),
  slug: z.string().trim().min(2).max(220),
  sku: z.string().trim().min(1).max(100).nullable().optional(),
  shortDescription: z.string().trim().max(500).nullable().optional(),
  description: z.string().trim().max(10000).nullable().optional(),
  price: z.coerce.number().nonnegative(),
  compareAtPrice: z.coerce.number().nonnegative().nullable().optional(),
  costPrice: z.coerce.number().nonnegative().nullable().optional(),
  currency: z.string().length(3).default("USD"),
  status: z.enum(["DRAFT", "ACTIVE", "ARCHIVED"]).optional(),
  audience: z.enum(["WOMEN", "MEN", "UNISEX", "KIDS"]).optional(),
  badge: z.string().trim().max(40).nullable().optional(),
  isFeatured: z.boolean().optional(),
  isTaxable: z.boolean().optional(),
  trackInventory: z.boolean().optional(),
  metaTitle: z.string().trim().max(200).nullable().optional(),
  metaDescription: z.string().trim().max(500).nullable().optional(),
  publishedAt: z.coerce.date().nullable().optional(),
});

export const productImageSchema = z.object({
  url: cloudinaryUrlSchema,
  altText: z.string().trim().max(200).nullable().optional(),
  sortOrder: z.number().int().min(0).optional(),
  isPrimary: z.boolean().optional(),
});

export const productVariantSchema = z.object({
  productId: z.string().min(1),
  name: z.string().trim().max(120).nullable().optional(),
  sku: z.string().trim().min(1).max(100),
  barcode: z.string().trim().max(100).nullable().optional(),
  price: z.coerce.number().nonnegative().nullable().optional(),
  compareAtPrice: z.coerce.number().nonnegative().nullable().optional(),
  costPrice: z.coerce.number().nonnegative().nullable().optional(),
  imageUrl: cloudinaryUrlSchema.nullable().optional(),
  isActive: z.boolean().optional(),
  weightGrams: z.number().int().nonnegative().nullable().optional(),
});
