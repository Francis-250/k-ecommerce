import type { Request, Response } from "express";
import { prisma } from "../lib/prisma";

const publicUserSelect = {
  id: true,
  email: true,
  firstName: true,
  lastName: true,
  username: true,
  avatar: true,
  role: true,
  isVerified: true,
  isActive: true,
} as const;

export const getSession = async (req: Request, res: Response) => {
  const user = await prisma.user.findUnique({
    where: { id: req.auth!.sub },
    select: publicUserSelect,
  });

  if (!user || !user.isActive) {
    res.clearCookie("token", { path: "/" });
    return res.status(401).json({
      success: false,
      message: "Your account is unavailable",
    });
  }

  return res.status(200).json({ success: true, user });
};

export const logout = (_req: Request, res: Response) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    path: "/",
  });

  return res.status(200).json({
    success: true,
    message: "Logout successful",
  });
};
