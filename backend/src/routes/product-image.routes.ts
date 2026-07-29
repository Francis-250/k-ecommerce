import { Router } from "express";
import {
  createProductImage,
  deleteProductImage,
  listProductImages,
  updateProductImage,
} from "../controllers/product-image.controller";
import { requireAdmin, verifyToken } from "../middlewares/auth.middleware";

const router = Router();
router.use(verifyToken, requireAdmin);
router.get("/", listProductImages);
router.post("/", createProductImage);
router.patch("/:id", updateProductImage);
router.delete("/:id", deleteProductImage);
export default router;
