import type { Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { paginated, pagination } from "../utils/http";
export const listAuditLogs = async (req: Request, res: Response) => {
  const { page, limit, skip } = pagination(req);
  const where = req.query.entityType
    ? { entityType: String(req.query.entityType) }
    : undefined;
  const [logs, total] = await prisma.$transaction([
    prisma.auditLog.findMany({
      where,
      skip,
      take: limit,
      include: {
        actor: {
          select: { id: true, email: true, firstName: true, lastName: true },
        },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.auditLog.count({ where }),
  ]);
  return res.json(paginated(logs, total, page, limit));
};
