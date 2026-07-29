import { Router } from "express";
import { deleteImage, uploadImage } from "../controllers/media.controller";
import { requireAdmin, verifyToken } from "../middlewares/auth.middleware";

const router = Router();

router.use(verifyToken, requireAdmin);
router.post("/images", uploadImage);
router.delete("/images", deleteImage);

export default router;
