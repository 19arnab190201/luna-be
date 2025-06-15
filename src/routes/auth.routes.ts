import { Router } from "express";
import { authController } from "../controllers/auth.controller";

const router = Router();

// Register new user
router.post("/register", authController.register);

// Login user
router.post("/login", authController.login);

// Verify OTP
router.post("/verify-otp", authController.verifyOTP);

// Refresh token
router.post("/refresh-token", authController.refreshToken);

export const authRoutes = router;
