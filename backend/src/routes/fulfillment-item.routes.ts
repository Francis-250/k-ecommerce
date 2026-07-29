import { Router } from "express";
import * as c from "../controllers/fulfillment-item.controller";
import { requireAdmin, verifyToken } from "../middlewares/auth.middleware";
const router = Router();
router.use(verifyToken, requireAdmin);
router.get("/", c.listFulfillmentItems);
router.post("/", c.createFulfillmentItem);
router.delete("/", c.deleteFulfillmentItem);
export default router;
