import multer from "multer";
import { AppError } from "./error-handler.middleware";

// File filter
const fileFilter = (
  req: Express.Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  // Accept image files and PDFs
  if (
    file.mimetype.startsWith("image/") ||
    file.mimetype === "application/pdf"
  ) {
    cb(null, true);
  } else {
    cb(new AppError("Only image files and PDFs are allowed", 400));
  }
};

// Configure multer with memory storage
export const uploadMiddleware = multer({
  storage: multer.memoryStorage(),
  fileFilter,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE || "5242880"), // 5MB default
  },
});

// Create specific upload handlers
export const uploadPrescription = uploadMiddleware.single("prescription");
export const uploadFile = uploadMiddleware.single("file");
