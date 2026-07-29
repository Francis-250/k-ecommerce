import type { Request, Response } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { paginated, pagination, validationError } from "../utils/http";
const schema = z.object({
  email: z.string().email(),
  source: z.string().max(100).optional(),
});
export const subscribe = async (req: Request, res: Response) => {
  const p = schema.safeParse(req.body);
  if (!p.success) return validationError(res, p.error);
  const subscriber = await prisma.newsletterSubscriber.upsert({
    where: { email: p.data.email.toLowerCase() },
    update: { isActive: true, unsubscribedAt: null, source: p.data.source },
    create: { email: p.data.email.toLowerCase(), source: p.data.source },
  });
  return res.status(201).json({ success: true, subscriber });
};
export const unsubscribe = async (req: Request, res: Response) => {
  const p = z.object({ email: z.string().email() }).safeParse(req.body);
  if (!p.success) return validationError(res, p.error);
  await prisma.newsletterSubscriber.updateMany({
    where: { email: p.data.email.toLowerCase() },
    data: { isActive: false, unsubscribedAt: new Date() },
  });
  return res.json({ success: true });
};
export const listSubscribers = async (req: Request, res: Response) => {
  const { page, limit, skip } = pagination(req);
  const [subscribers, total] = await prisma.$transaction([
    prisma.newsletterSubscriber.findMany({
      skip,
      take: limit,
      orderBy: { subscribedAt: "desc" },
    }),
    prisma.newsletterSubscriber.count(),
  ]);
  return res.json(paginated(subscribers, total, page, limit));
};
