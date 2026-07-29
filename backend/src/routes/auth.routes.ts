import { Router } from "express";
import {
  getGoogleClientConfig,
  googleLogin,
  login,
  register,
  verifyOtp,
} from "../controllers/auth.controller";
import { getSession, logout } from "../controllers/session.controller";
import {
  forgotPassword,
  resetPassword,
} from "../controllers/password.controller";
import { verifyToken } from "../middlewares/auth.middleware";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.get("/google/config", getGoogleClientConfig);
router.post("/google", googleLogin);
router.post("/verify-email", verifyOtp);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);
router.get("/me", verifyToken, getSession);
router.post("/logout", logout);

export default router;
