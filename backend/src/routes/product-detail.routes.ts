import { Router } from "express";
import * as controller from "../controllers/product-detail.controller";
import { requireAdmin, verifyToken } from "../middlewares/auth.middleware";
const router = Router();
router.get("/", controller.listProductDetails);
router.post("/", verifyToken, requireAdmin, controller.createProductDetail);
router.patch("/:id", verifyToken, requireAdmin, controller.updateProductDetail);
router.delete(
  "/:id",
  verifyToken,
  requireAdmin,
  controller.deleteProductDetail,
);
export default router;
