"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authMiddleware = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const error_handler_middleware_1 = require("./error-handler.middleware");
const User_model_1 = require("../models/User.model");
const authMiddleware = async (req, res, next) => {
    try {
        // 1) Get token from header
        const authHeader = req.headers.authorization;
        // console.log("authHeader", authHeader);
        if (!authHeader?.startsWith("Bearer ")) {
            throw new error_handler_middleware_1.AppError("Please log in to access this resource", 401);
        }
        const token = authHeader.split(" ")[1];
        // console.log("token", token);
        // 2) Verify token
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET || "your-jwt-secret");
        // 3) Check if user still exists
        const user = await User_model_1.User.findById(decoded.id);
        if (!user) {
            throw new error_handler_middleware_1.AppError("User no longer exists", 401);
        }
        // 4) Check if user is active
        if (!user.isActive) {
            throw new error_handler_middleware_1.AppError("User account is deactivated", 401);
        }
        // 5) Grant access to protected route
        req.user = user;
        next();
    }
    catch (error) {
        if (error instanceof jsonwebtoken_1.default.JsonWebTokenError) {
            next(new error_handler_middleware_1.AppError("Invalid token. Please log in again", 401));
        }
        else {
            next(error);
        }
    }
};
exports.authMiddleware = authMiddleware;
//# sourceMappingURL=auth.middleware.js.map