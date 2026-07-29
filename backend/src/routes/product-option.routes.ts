import { Router } from "express";
import * as controller from "../controllers/product-option.controller";
import { requireAdmin, verifyToken } from "../middlewares/auth.middleware";
const router = Router();
router.get("/", controller.listProductOptions);
router.post("/", verifyToken, requireAdmin, controller.createProductOption);
router.patch("/:id", verifyToken, requireAdmin, controller.updateProductOption);
router.delete(
  "/:id",
  verifyToken,
  requireAdmin,
  controller.deleteProductOption,
);
export default router;
