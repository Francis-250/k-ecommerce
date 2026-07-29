import { Router } from "express";
import { listAuditLogs } from "../controllers/audit-log.controller";
import { requireAdmin, verifyToken } from "../middlewares/auth.middleware";
const router = Router();
router.get("/", verifyToken, requireAdmin, listAuditLogs);
export default router;
