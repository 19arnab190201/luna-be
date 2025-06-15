"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadFile = exports.uploadPrescription = exports.uploadMiddleware = void 0;
const multer_1 = __importDefault(require("multer"));
const cloudinary_1 = require("cloudinary");
const multer_storage_cloudinary_1 = require("multer-storage-cloudinary");
const error_handler_middleware_1 = require("./error-handler.middleware");
// Configure Cloudinary
cloudinary_1.v2.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});
// Configure Cloudinary storage
const storage = new multer_storage_cloudinary_1.CloudinaryStorage({
    cloudinary: cloudinary_1.v2,
    params: {
        folder: "prescriptions",
        allowed_formats: ["jpg", "jpeg", "png", "pdf"],
        resource_type: "auto",
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
// Configure multer with memory storage
exports.uploadMiddleware = (0, multer_1.default)({
    storage: multer_1.default.memoryStorage(),
    fileFilter,
    limits: {
        fileSize: parseInt(process.env.MAX_FILE_SIZE || "5242880"), // 5MB default
    },
});
// Create specific upload handlers
exports.uploadPrescription = exports.uploadMiddleware.single("prescription");
exports.uploadFile = exports.uploadMiddleware.single("file");
//# sourceMappingURL=upload.middleware.js.map