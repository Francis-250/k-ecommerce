import type { Request, Response } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import {
  cloudinaryUrlSchema,
  idParamsSchema,
  validationError,
} from "../utils/http";
const schema = z.object({
  title: z.string().min(2).max(200),
  slug: z.string().min(2).max(220),
  client: z.string().max(160).nullable().optional(),
  category: z.string().max(120).nullable().optional(),
  description: z.string().max(1000).nullable().optional(),
  content: z.string().nullable().optional(),
  coverImageUrl: cloudinaryUrlSchema.nullable().optional(),
  gallery: z.array(cloudinaryUrlSchema).optional(),
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]).optional(),
  completedAt: z.coerce.date().nullable().optional(),
  publishedAt: z.coerce.date().nullable().optional(),
});
export const listPortfolioProjects = async (req: Request, res: Response) =>
  res.json({
    success: true,
    projects: await prisma.portfolioProject.findMany({
      where: req.query.admin === "true" ? undefined : { status: "PUBLISHED" },
      orderBy: { publishedAt: "desc" },
    }),
  });
export const getPortfolioProject = async (req: Request, res: Response) => {
  const key = String(req.params.id);
  const project = await prisma.portfolioProject.findFirst({
    where: { OR: [{ id: key }, { slug: key }] },
  });
  if (!project)
    return res
      .status(404)
      .json({ success: false, message: "Project not found" });
  return res.json({ success: true, project });
};
export const createPortfolioProject = async (req: Request, res: Response) => {
  const p = schema.safeParse(req.body);
  if (!p.success) return validationError(res, p.error);
  return res
    .status(201)
    .json({
      success: true,
      project: await prisma.portfolioProject.create({ data: p.data }),
    });
};
export const updatePortfolioProject = async (req: Request, res: Response) => {
  const { id } = idParamsSchema.parse(req.params);
  const p = schema.partial().safeParse(req.body);
  if (!p.success) return validationError(res, p.error);
  return res.json({
    success: true,
    project: await prisma.portfolioProject.update({
      where: { id },
      data: p.data,
    }),
  });
};
export const deletePortfolioProject = async (req: Request, res: Response) => {
  const { id } = idParamsSchema.parse(req.params);
  await prisma.portfolioProject.update({
    where: { id },
    data: { status: "ARCHIVED" },
  });
  return res.status(204).send();
};
