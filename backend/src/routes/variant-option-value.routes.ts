import { Router } from "express";
import * as controller from "../controllers/variant-option-value.controller";
import { requireAdmin, verifyToken } from "../middlewares/auth.middleware";
const router = Router();
router.use(verifyToken, requireAdmin);
router.get("/", controller.listVariantOptionValues);
router.post("/", controller.createVariantOptionValue);
router.delete("/", controller.deleteVariantOptionValue);
export default router;
