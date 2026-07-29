import { Router } from "express";
import * as controller from "../controllers/review.controller";
import { requireAdmin, verifyToken } from "../middlewares/auth.middleware";
const router = Router();
router.get("/", controller.listReviews);
router.post("/", verifyToken, controller.createReview);
router.patch("/:id", verifyToken, controller.updateReview);
router.delete("/:id", verifyToken, controller.deleteReview);
router.patch(
  "/:id/moderate",
  verifyToken,
  requireAdmin,
  controller.moderateReview,
);
export default router;
