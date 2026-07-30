import { Router } from "express";
import * as controller from "../controllers/analytics.controller";
import { requireAdmin, verifyToken } from "../middlewares/auth.middleware";

const router = Router();
router.get("/overview", verifyToken, requireAdmin, controller.getAnalyticsOverview);

export default router;
