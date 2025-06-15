"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadFile = exports.uploadPrescription = exports.uploadMiddleware = void 0;
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const error_handler_middleware_1 = require("./error-handler.middleware");
// Configure storage
const storage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path_1.default.join(process.cwd(), "uploads", "prescriptions"));
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        cb(null, file.fieldname + "-" + uniqueSuffix + path_1.default.extname(file.originalname));
    },
});
// File filter
const fileFilter = (req, file, cb) => {
    // Accept image files and PDFs
    if (file.mimetype.startsWith("image/") ||
        file.mimetype === "application/pdf") {
        cb(null, true);
    }
    else {
        cb(new error_handler_middleware_1.AppError("Only image files and PDFs are allowed", 400));
    }
};
// Configure multer
exports.uploadMiddleware = (0, multer_1.default)({
    storage,
    fileFilter,
    limits: {
        fileSize: parseInt(process.env.MAX_FILE_SIZE || "5242880"), // 5MB default
    },
});
// Create specific upload handlers
exports.uploadPrescription = exports.uploadMiddleware.single("prescription");
exports.uploadFile = exports.uploadMiddleware.single("file");
//# sourceMappingURL=upload.middleware.js.map