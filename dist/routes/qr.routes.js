"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const express_validator_1 = require("express-validator");
const validation_middleware_1 = require("../middleware/validation.middleware");
const auth_middleware_1 = require("../middleware/auth.middleware");
const qr_controller_1 = require("../controllers/qr.controller");
const router = (0, express_1.Router)();
// Apply authentication middleware to all routes
router.use(auth_middleware_1.authMiddleware);
// Generate QR code for patient
router.get("/generate/:patientId", [
    (0, express_validator_1.param)("patientId").isMongoId().withMessage("Invalid patient ID"),
    validation_middleware_1.validateRequest,
], qr_controller_1.qrController.generateQRCode);
// Scan QR code
router.post("/scan", [
    (0, express_validator_1.body)("qrData").notEmpty().withMessage("QR data is required"),
    validation_middleware_1.validateRequest,
], qr_controller_1.qrController.scanQRCode);
// Get QR code history
router.get("/history/:patientId", [
    (0, express_validator_1.param)("patientId").isMongoId().withMessage("Invalid patient ID"),
    validation_middleware_1.validateRequest,
], qr_controller_1.qrController.getQRCodeHistory);
exports.default = router;
//# sourceMappingURL=qr.routes.js.map