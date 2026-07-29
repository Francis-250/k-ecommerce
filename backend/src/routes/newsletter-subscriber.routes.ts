import { Router } from "express";
import * as c from "../controllers/newsletter-subscriber.controller";
import { requireAdmin, verifyToken } from "../middlewares/auth.middleware";
const router = Router();
router.post("/", c.subscribe);
router.post("/unsubscribe", c.unsubscribe);
router.get("/", verifyToken, requireAdmin, c.listSubscribers);
export default router;
