import { Request, Response, NextFunction } from "express";
import { verifyJWT } from "../utils/helpers";

export const verifyToken = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const token = req.cookies?.token;

  if (!token) {
    res.status(404).json({ message: "No User Login Again" });
  }
  try {
    const decodedToken = verifyJWT(token, process.env.JWT_SECRET!);
    req.user = decodedToken;
    next();
  } catch (error) {
    console.log(error);
    res.status(401).json({ message: "Invalid token" });
  }
};
