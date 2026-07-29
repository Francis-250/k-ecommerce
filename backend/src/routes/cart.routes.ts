import { Router } from "express";
import * as controller from "../controllers/cart.controller";
import { verifyToken } from "../middlewares/auth.middleware";
const router = Router();
router.use(verifyToken);
router.get("/", controller.getCart);
router.delete("/", controller.clearCart);
export default router;
