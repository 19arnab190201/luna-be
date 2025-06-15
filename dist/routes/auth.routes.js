"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authRoutes = void 0;
const express_1 = require("express");
const auth_controller_1 = require("../controllers/auth.controller");
const router = (0, express_1.Router)();
// Register new user
router.post("/register", auth_controller_1.authController.register);
// Login user
router.post("/login", auth_controller_1.authController.login);
// Verify OTP
router.post("/verify-otp", auth_controller_1.authController.verifyOTP);
// Refresh token
router.post("/refresh-token", auth_controller_1.authController.refreshToken);
exports.authRoutes = router;
//# sourceMappingURL=auth.routes.js.map