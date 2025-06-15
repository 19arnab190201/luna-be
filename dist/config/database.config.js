"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectDB = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const error_handler_middleware_1 = require("../middleware/error-handler.middleware");
const connectDB = async () => {
    try {
        const conn = await mongoose_1.default.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/prescription-ai");
        console.log(`MongoDB Connected: ${conn.connection.host}`);
        // Handle connection events
        mongoose_1.default.connection.on("error", (err) => {
            console.error("MongoDB connection error:", err);
        });
        mongoose_1.default.connection.on("disconnected", () => {
            console.warn("MongoDB disconnected. Attempting to reconnect...");
        });
        mongoose_1.default.connection.on("reconnected", () => {
            console.info("MongoDB reconnected");
        });
    }
    catch (error) {
        console.error("Error connecting to MongoDB:", error);
        throw new error_handler_middleware_1.AppError("Database connection failed", 500);
    }
};
exports.connectDB = connectDB;
//# sourceMappingURL=database.config.js.map