import { Router } from "express";
import * as controller from "../controllers/wishlist-item.controller";
import { verifyToken } from "../middlewares/auth.middleware";
const router = Router();
router.use(verifyToken);
router.get("/", controller.listWishlistItems);
router.post("/", controller.createWishlistItem);
router.delete("/:productId", controller.deleteWishlistItem);
export default router;
