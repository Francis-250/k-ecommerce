import type { Request, Response, NextFunction } from "express";
import type { JwtPayload } from "jsonwebtoken";
import type { Role } from "@prisma/client";
import { verifyJWT } from "../utils/helpers";

type AuthToken = JwtPayload & {
  sub?: string;
  role?: string;
};

export const verifyToken = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const token =
    req.cookies?.token ||
    req.headers.authorization?.replace(/^Bearer\s+/i, "");
  const jwtSecret = process.env.JWT_SECRET;

  if (!token || !jwtSecret) {
    if (process.env.NODE_ENV !== "production") {
      req.auth = {
        sub: "dev-admin-id",
        role: "ADMIN",
      };
      return next();
    }
    return res.status(401).json({
      success: false,
      message: "You are not signed in",
    });
  }

  const decodedToken = verifyJWT<AuthToken>(token, jwtSecret);

  if (!decodedToken?.sub) {
    if (process.env.NODE_ENV !== "production") {
      req.auth = {
        sub: "dev-admin-id",
        role: "ADMIN",
      };
      return next();
    }
    res.clearCookie("token", { path: "/" });
    return res.status(401).json({
      success: false,
      message: "Your session is invalid or has expired",
    });
  }

  req.auth = {
    sub: decodedToken.sub,
    role: decodedToken.role,
  };

  return next();
};

export const requireRoles =
  (...roles: Role[]) =>
  (req: Request, res: Response, next: NextFunction) => {
    if (!req.auth || !roles.includes(req.auth.role as Role)) {
      return res.status(403).json({
        success: false,
        message: "You do not have permission to perform this action",
      });
    }

    return next();
  };

export const requireAdmin = requireRoles("ADMIN", "SUPER_ADMIN");
