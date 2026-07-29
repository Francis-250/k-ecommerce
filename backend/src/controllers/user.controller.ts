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

const profileSchema = z.object({
  firstName: z.string().trim().min(1).max(80).optional(),
  lastName: z.string().trim().min(1).max(80).optional(),
  username: z.string().trim().min(3).max(50).nullable().optional(),
  bio: z.string().trim().max(1000).nullable().optional(),
  phone: z.string().trim().max(30).nullable().optional(),
  avatar: cloudinaryUrlSchema.nullable().optional(),
  acceptsMarketing: z.boolean().optional(),
});
const adminSchema = profileSchema.extend({
  role: z.enum(["CUSTOMER", "STAFF", "ADMIN", "SUPER_ADMIN"]).optional(),
  isActive: z.boolean().optional(),
  isBanned: z.boolean().optional(),
  taxExempt: z.boolean().optional(),
});
const select = {
  id: true,
  email: true,
  firstName: true,
  lastName: true,
  username: true,
  bio: true,
  phone: true,
  avatar: true,
  role: true,
  isVerified: true,
  isActive: true,
  isBanned: true,
  acceptsMarketing: true,
  taxExempt: true,
  lastLogin: true,
  createdAt: true,
  updatedAt: true,
} as const;

export const getProfile = async (req: Request, res: Response) => {
  const user = await prisma.user.findUnique({
    where: { id: req.auth!.sub },
    select,
  });
  return res.json({ success: true, user });
};
export const updateProfile = async (req: Request, res: Response) => {
  const parsed = profileSchema.safeParse(req.body);
  if (!parsed.success) return validationError(res, parsed.error);
  const user = await prisma.user.update({
    where: { id: req.auth!.sub },
    data: parsed.data,
    select,
  });
  return res.json({ success: true, user });
};
export const listUsers = async (req: Request, res: Response) => {
  const { page, limit, skip } = pagination(req);
  const search =
    typeof req.query.search === "string" ? req.query.search : undefined;
  const where = search
    ? {
        OR: [
          { email: { contains: search, mode: "insensitive" as const } },
          { firstName: { contains: search, mode: "insensitive" as const } },
          { lastName: { contains: search, mode: "insensitive" as const } },
        ],
      }
    : undefined;
  const [users, total] = await prisma.$transaction([
    prisma.user.findMany({
      where,
      skip,
      take: limit,
      select,
      orderBy: { createdAt: "desc" },
    }),
    prisma.user.count({ where }),
  ]);
  return res.json(paginated(users, total, page, limit));
};
export const getUser = async (req: Request, res: Response) => {
  const { id } = idParamsSchema.parse(req.params);
  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      ...select,
      addresses: true,
      orders: { take: 10, orderBy: { createdAt: "desc" } },
    },
  });
  if (!user)
    return res.status(404).json({ success: false, message: "User not found" });
  return res.json({ success: true, user });
};
export const updateUser = async (req: Request, res: Response) => {
  const { id } = idParamsSchema.parse(req.params);
  const parsed = adminSchema.safeParse(req.body);
  if (!parsed.success) return validationError(res, parsed.error);
  const user = await prisma.user.update({
    where: { id },
    data: parsed.data,
    select,
  });
  return res.json({ success: true, user });
};
export const deleteUser = async (req: Request, res: Response) => {
  const { id } = idParamsSchema.parse(req.params);
  await prisma.user.update({
    where: { id },
    data: { isActive: false, isBanned: true },
  });
  return res.status(204).send();
};
