import { Router } from "express";
import { listCouponRedemptions } from "../controllers/coupon-redemption.controller";
import { requireAdmin, verifyToken } from "../middlewares/auth.middleware";
const router = Router();
router.get("/", verifyToken, requireAdmin, listCouponRedemptions);
export default router;
