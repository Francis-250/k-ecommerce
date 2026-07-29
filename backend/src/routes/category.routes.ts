import { Router } from "express";
import {
  createCategory,
  deleteCategory,
  listCategories,
  updateCategory,
} from "../controllers/category.controller";
import { requireAdmin, verifyToken } from "../middlewares/auth.middleware";

const router = Router();
router.get("/", listCategories);
router.post("/", verifyToken, requireAdmin, createCategory);
router.patch("/:id", verifyToken, requireAdmin, updateCategory);
router.delete("/:id", verifyToken, requireAdmin, deleteCategory);
export default router;
