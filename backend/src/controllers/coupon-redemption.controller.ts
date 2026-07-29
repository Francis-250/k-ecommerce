import type { Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { paginated, pagination } from "../utils/http";
export const listCouponRedemptions = async (req: Request, res: Response) => {
  const { page, limit, skip } = pagination(req);
  const where = req.query.couponId
    ? { couponId: String(req.query.couponId) }
    : undefined;
  const [redemptions, total] = await prisma.$transaction([
    prisma.couponRedemption.findMany({
      where,
      skip,
      take: limit,
      include: {
        coupon: true,
        order: true,
        user: { select: { id: true, email: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.couponRedemption.count({ where }),
  ]);
  return res.json(paginated(redemptions, total, page, limit));
};
