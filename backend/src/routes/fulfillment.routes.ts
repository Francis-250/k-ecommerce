import { Router } from "express";
import * as c from "../controllers/fulfillment.controller";
import { requireAdmin, verifyToken } from "../middlewares/auth.middleware";
const router = Router();
router.use(verifyToken, requireAdmin);
router.get("/", c.listFulfillments);
router.post("/", c.createFulfillment);
router.patch("/:id", c.updateFulfillment);
export default router;
