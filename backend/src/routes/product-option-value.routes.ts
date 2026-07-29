import { Router } from "express";
import * as controller from "../controllers/product-option-value.controller";
import { requireAdmin, verifyToken } from "../middlewares/auth.middleware";
const router = Router();
router.get("/", controller.listProductOptionValues);
router.post(
  "/",
  verifyToken,
  requireAdmin,
  controller.createProductOptionValue,
);
router.patch(
  "/:id",
  verifyToken,
  requireAdmin,
  controller.updateProductOptionValue,
);
router.delete(
  "/:id",
  verifyToken,
  requireAdmin,
  controller.deleteProductOptionValue,
);
export default router;
