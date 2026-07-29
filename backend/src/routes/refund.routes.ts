import { Router } from "express";
import * as c from "../controllers/refund.controller";
import { requireAdmin, verifyToken } from "../middlewares/auth.middleware";
const router = Router();
router.use(verifyToken, requireAdmin);
router.get("/", c.listRefunds);
router.post("/", c.createRefund);
router.patch("/:id", c.updateRefund);
export default router;
