"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authController = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_model_1 = require("../models/User.model");
const error_handler_middleware_1 = require("../middleware/error-handler.middleware");
const otp_service_1 = require("../services/otp.service");
// Helper function to generate SEHAT ID
const generateSehatId = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let sehatId = "";
    for (let i = 0; i < 8; i++) {
        sehatId += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return sehatId;
};
class AuthController {
    constructor() {
        // Register new user
        this.register = async (req, res, next) => {
            try {
                const { phoneNumber, userType, name, dateOfBirth, gender } = req.body;
                if (!name) {
                    throw new error_handler_middleware_1.AppError("Name is required", 400);
                }
                // Check if user already exists
                const existingUser = await User_model_1.User.findOne({ phoneNumber });
                if (existingUser) {
                    throw new error_handler_middleware_1.AppError("User already exists with this phone number", 400);
                }
                // Generate unique SEHAT ID
                let sehatId;
                let isUnique = false;
                while (!isUnique) {
                    sehatId = generateSehatId();
                    const existingSehatId = await User_model_1.User.findOne({ sehatId });
                    if (!existingSehatId) {
                        isUnique = true;
                    }
                }
                // Create new user
                const user = await User_model_1.User.create({
                    phoneNumber,
                    userType,
                    name,
                    sehatId,
                    dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined,
                    gender,
                });
                // Generate and send OTP
                // const otp = await generateOTP(phoneNumber);
                res.status(201).json({
                    status: "success",
                    message: "User registered successfully. Please verify your phone number.",
                    data: {
                        userId: user._id,
                        phoneNumber: user.phoneNumber,
                        userType: user.userType,
                        name: user.name,
                        sehatId: user.sehatId,
                        dateOfBirth: user.dateOfBirth,
                        gender: user.gender,
                    },
                });
            }
            catch (error) {
                next(error);
            }
        };
        // Login user
        this.login = async (req, res, next) => {
            try {
                const { phoneNumber } = req.body;
                // Find user
                const user = await User_model_1.User.findOne({ phoneNumber });
                if (!user) {
                    throw new error_handler_middleware_1.AppError("No user found with this phone number", 404);
                }
                // Generate and send OTP
                // const otp = await generateOTP(phoneNumber);
                res.status(200).json({
                    status: "success",
                    message: "OTP sent successfully",
                    data: {
                        userId: user._id,
                        phoneNumber: user.phoneNumber,
                    },
                });
            }
            catch (error) {
                next(error);
            }
        };
        // Verify OTP
        this.verifyOTP = async (req, res, next) => {
            try {
                const { phoneNumber, otp } = req.body;
                // Verify OTP
                const isValid = await (0, otp_service_1.verifyOTP)(phoneNumber, otp);
                if (!isValid) {
                    throw new error_handler_middleware_1.AppError("Invalid OTP", 400);
                }
                // Find user
                const user = await User_model_1.User.findOne({ phoneNumber });
                if (!user) {
                    throw new error_handler_middleware_1.AppError("User not found", 404);
                }
                // Update user verification status
                user.isPhoneVerified = true;
                user.lastLogin = new Date();
                await user.save();
                // Generate tokens
                const jwtOptions = {
                    expiresIn: 604800, // 7 days in seconds
                };
                const refreshOptions = {
                    expiresIn: 2592000, // 30 days in seconds
                };
                const accessToken = jsonwebtoken_1.default.sign({ id: user._id, userType: user.userType }, process.env.JWT_SECRET || "your-jwt-secret", jwtOptions);
                const refreshToken = jsonwebtoken_1.default.sign({ id: user._id }, process.env.JWT_REFRESH_SECRET || "your-refresh-secret", refreshOptions);
                res.status(200).json({
                    status: "success",
                    message: "Phone number verified successfully",
                    data: {
                        accessToken,
                        refreshToken,
                        user: {
                            id: user._id,
                            phoneNumber: user.phoneNumber,
                            userType: user.userType,
                            isPhoneVerified: user.isPhoneVerified,
                            name: user.name,
                            sehatId: user.sehatId,
                        },
                    },
                });
            }
            catch (error) {
                next(error);
            }
        };
        // Refresh token
        this.refreshToken = async (req, res, next) => {
            try {
                const { refreshToken } = req.body;
                // Verify refresh token
                const decoded = jsonwebtoken_1.default.verify(refreshToken, process.env.JWT_REFRESH_SECRET || "your-refresh-secret");
                // Find user
                const user = await User_model_1.User.findById(decoded.id);
                if (!user) {
                    throw new error_handler_middleware_1.AppError("User not found", 404);
                }
                // Generate new access token
                const jwtOptions = {
                    expiresIn: 604800, // 7 days in seconds
                };
                const accessToken = jsonwebtoken_1.default.sign({ id: user._id, userType: user.userType }, process.env.JWT_SECRET || "your-jwt-secret", jwtOptions);
                res.status(200).json({
                    status: "success",
                    data: {
                        accessToken,
                    },
                });
            }
            catch (error) {
                next(error);
            }
        };
    }
}
exports.authController = new AuthController();
//# sourceMappingURL=auth.controller.js.map