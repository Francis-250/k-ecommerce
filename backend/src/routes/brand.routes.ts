import { Router } from "express";
import {
  createBrand,
  deleteBrand,
  listBrands,
  updateBrand,
} from "../controllers/brand.controller";
import { requireAdmin, verifyToken } from "../middlewares/auth.middleware";

const router = Router();
router.get("/", listBrands);
router.post("/", verifyToken, requireAdmin, createBrand);
router.patch("/:id", verifyToken, requireAdmin, updateBrand);
router.delete("/:id", verifyToken, requireAdmin, deleteBrand);
export default router;
