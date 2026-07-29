import { Router } from "express";
import * as controller from "../controllers/inventory-movement.controller";
import { requireAdmin, verifyToken } from "../middlewares/auth.middleware";
const router = Router();
router.use(verifyToken, requireAdmin);
router.get("/", controller.listInventoryMovements);
router.post("/", controller.createInventoryMovement);
export default router;
