import { Router } from "express";
import * as controller from "../controllers/cart-item.controller";
import { verifyToken } from "../middlewares/auth.middleware";
const router = Router();
router.use(verifyToken);
router.post("/", controller.createCartItem);
router.patch("/:id", controller.updateCartItem);
router.delete("/:id", controller.deleteCartItem);
export default router;
