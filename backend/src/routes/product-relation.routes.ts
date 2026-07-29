import { Router } from "express";
import * as controller from "../controllers/product-relation.controller";
import { requireAdmin, verifyToken } from "../middlewares/auth.middleware";
const router = Router();
router.get("/", controller.listProductRelations);
router.post("/", verifyToken, requireAdmin, controller.createProductRelation);
router.delete("/", verifyToken, requireAdmin, controller.deleteProductRelation);
export default router;
