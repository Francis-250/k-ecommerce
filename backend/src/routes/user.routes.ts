import { Router } from "express";
import { getUsers } from "../controllers/user.controller";

const router = Router();

router.get("/register", getUsers);

export default router;
