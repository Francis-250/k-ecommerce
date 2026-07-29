import { Router } from "express";
import {
  createProductVariant,
  deleteProductVariant,
  listProductVariants,
  updateProductVariant,
} from "../controllers/product-variant.controller";
import { requireAdmin, verifyToken } from "../middlewares/auth.middleware";

const router = Router();
router.get("/", listProductVariants);
router.post("/", verifyToken, requireAdmin, createProductVariant);
router.patch("/:id", verifyToken, requireAdmin, updateProductVariant);
router.delete("/:id", verifyToken, requireAdmin, deleteProductVariant);
export default router;
