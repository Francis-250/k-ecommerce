import type { Request, Response } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import {
  cloudinaryUrlSchema,
  idParamsSchema,
  paginated,
  pagination,
  validationError,
} from "../utils/http";
const schema = z.object({
  title: z.string().min(2).max(200),
  slug: z.string().min(2).max(220),
  excerpt: z.string().max(600).nullable().optional(),
  content: z.string().min(1),
  coverImageUrl: cloudinaryUrlSchema.nullable().optional(),
  authorName: z.string().max(120).nullable().optional(),
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]).optional(),
  metaTitle: z.string().max(200).nullable().optional(),
  metaDescription: z.string().max(500).nullable().optional(),
  publishedAt: z.coerce.date().nullable().optional(),
});
export const listArticles = async (req: Request, res: Response) => {
  const { page, limit, skip } = pagination(req);
  const where =
    req.query.admin === "true" ? undefined : { status: "PUBLISHED" as const };
  const [articles, total] = await prisma.$transaction([
    prisma.article.findMany({
      where,
      skip,
      take: limit,
      orderBy: { publishedAt: "desc" },
    }),
    prisma.article.count({ where }),
  ]);
  return res.json(paginated(articles, total, page, limit));
};
export const getArticle = async (req: Request, res: Response) => {
  const key = String(req.params.id);
  const article = await prisma.article.findFirst({
    where: { OR: [{ id: key }, { slug: key }] },
  });
  if (!article)
    return res
      .status(404)
      .json({ success: false, message: "Article not found" });
  return res.json({ success: true, article });
};
export const createArticle = async (req: Request, res: Response) => {
  const p = schema.safeParse(req.body);
  if (!p.success) return validationError(res, p.error);
  return res
    .status(201)
    .json({
      success: true,
      article: await prisma.article.create({ data: p.data }),
    });
};
export const updateArticle = async (req: Request, res: Response) => {
  const { id } = idParamsSchema.parse(req.params);
  const p = schema.partial().safeParse(req.body);
  if (!p.success) return validationError(res, p.error);
  return res.json({
    success: true,
    article: await prisma.article.update({ where: { id }, data: p.data }),
  });
};
export const deleteArticle = async (req: Request, res: Response) => {
  const { id } = idParamsSchema.parse(req.params);
  await prisma.article.update({ where: { id }, data: { status: "ARCHIVED" } });
  return res.status(204).send();
};
