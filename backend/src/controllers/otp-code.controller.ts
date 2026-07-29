import type { Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { paginated, pagination } from "../utils/http";
export const listOtpCodes = async (req: Request, res: Response) => {
  const { page, limit, skip } = pagination(req);
  const [records, total] = await prisma.$transaction([
    prisma.otpCodes.findMany({
      skip,
      take: limit,
      select: {
        id: true,
        userId: true,
        otp_type: true,
        otp_expiry: true,
        attempts: true,
        consumedAt: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.otpCodes.count(),
  ]);
  return res.json(paginated(records, total, page, limit));
};
export const purgeExpiredOtpCodes = async (_req: Request, res: Response) => {
  const result = await prisma.otpCodes.deleteMany({
    where: { otp_expiry: { lt: new Date() } },
  });
  return res.json({ success: true, deleted: result.count });
};
