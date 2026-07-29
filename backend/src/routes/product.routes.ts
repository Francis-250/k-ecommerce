import { Router } from "express";
import {
  createProduct,
  deleteProduct,
  getProduct,
  listProducts,
  updateProduct,
} from "../controllers/product.controller";
import { requireAdmin, verifyToken } from "../middlewares/auth.middleware";

const router = Router();
router.get("/", listProducts);
router.get("/:id", getProduct);
router.post("/", verifyToken, requireAdmin, createProduct);
router.patch("/:id", verifyToken, requireAdmin, updateProduct);
router.delete("/:id", verifyToken, requireAdmin, deleteProduct);
export default router;
