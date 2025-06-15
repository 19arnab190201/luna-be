"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.appConfig = void 0;
const dotenv_1 = require("dotenv");
const path_1 = __importDefault(require("path"));
// Load environment variables
(0, dotenv_1.config)();
exports.appConfig = {
    // Server configuration
    port: process.env.PORT || 3000,
    nodeEnv: process.env.NODE_ENV || "development",
    isProduction: process.env.NODE_ENV === "production",
    // JWT configuration
    jwt: {
        secret: process.env.JWT_SECRET || "your-jwt-secret-key",
        expiresIn: process.env.JWT_EXPIRES_IN || "7d",
        refreshSecret: process.env.JWT_REFRESH_SECRET || "your-refresh-secret-key",
        refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "30d",
    },
    // File upload configuration
    upload: {
        maxFileSize: parseInt(process.env.MAX_FILE_SIZE || "5242880"), // 5MB
        uploadDir: process.env.UPLOAD_DIR || "uploads",
        prescriptionDir: path_1.default.join(process.env.UPLOAD_DIR || "uploads", "prescriptions"),
    },
    // SMS configuration
    sms: {
        provider: process.env.SMS_PROVIDER || "twilio",
        accountSid: process.env.SMS_ACCOUNT_SID,
        authToken: process.env.SMS_AUTH_TOKEN,
        fromNumber: process.env.SMS_FROM_NUMBER,
    },
    // Logging configuration
    logging: {
        level: process.env.LOG_LEVEL || "debug",
    },
    // Rate limiting configuration
    rateLimit: {
        windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || "900000"), // 15 minutes
        maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || "100"),
    },
    // CORS configuration
    cors: {
        origin: process.env.CORS_ORIGIN || "http://localhost:3000",
    },
    // API documentation
    apiDocs: {
        path: process.env.API_DOCS_PATH || "/api-docs",
    },
};
//# sourceMappingURL=app.config.js.map