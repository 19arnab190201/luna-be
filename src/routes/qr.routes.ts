import { Router } from "express";
import { body, param } from "express-validator";
import { validateRequest } from "../middleware/validation.middleware";
import { authMiddleware } from "../middleware/auth.middleware";
import { qrController } from "../controllers/qr.controller";

const router = Router();

// Apply authentication middleware to all routes
router.use(authMiddleware);

// Generate QR code for patient
router.get(
  "/generate/:patientId",
  [
    param("patientId").isMongoId().withMessage("Invalid patient ID"),
    validateRequest,
  ],
  qrController.generateQRCode
);

// Scan QR code
router.post(
  "/scan",
  [
    body("qrData").notEmpty().withMessage("QR data is required"),
    validateRequest,
  ],
  qrController.scanQRCode
);

// Get QR code history
router.get(
  "/history/:patientId",
  [
    param("patientId").isMongoId().withMessage("Invalid patient ID"),
    validateRequest,
  ],
  qrController.getQRCodeHistory
);

export default router;
