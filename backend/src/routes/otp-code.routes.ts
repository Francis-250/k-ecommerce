import { Router } from "express";
import * as controller from "../controllers/otp-code.controller";
import { requireAdmin, verifyToken } from "../middlewares/auth.middleware";
const router = Router();
router.use(verifyToken, requireAdmin);
router.get("/", controller.listOtpCodes);
router.delete("/expired", controller.purgeExpiredOtpCodes);
export default router;
