"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.qrController = void 0;
const error_handler_middleware_1 = require("../middleware/error-handler.middleware");
const qrcode_1 = __importDefault(require("qrcode"));
const AISummary_model_1 = require("../models/AISummary.model");
class QRController {
    constructor() {
        // Generate QR code for prescription
        this.generateQR = async (req, res, next) => {
            try {
                const { summaryId } = req.params;
                const summary = await AISummary_model_1.AISummary.findById(summaryId);
                if (!summary) {
                    throw new error_handler_middleware_1.AppError("Summary not found", 404);
                }
                // Generate unique QR code data
                const qrData = {
                    summaryId: summary._id,
                    timestamp: Date.now(),
                };
                // Generate QR code
                const qrCode = await qrcode_1.default.toDataURL(JSON.stringify(qrData));
                // Update summary with QR code
                summary.qrCode = qrCode;
                await summary.save();
                res.status(200).json({
                    status: "success",
                    data: {
                        qrCode,
                        summaryId: summary._id,
                    },
                });
            }
            catch (error) {
                next(error);
            }
        };
        // Get QR code for prescription
        this.getQR = async (req, res, next) => {
            try {
                const { summaryId } = req.params;
                const summary = await AISummary_model_1.AISummary.findById(summaryId);
                if (!summary) {
                    throw new error_handler_middleware_1.AppError("Summary not found", 404);
                }
                if (!summary.qrCode) {
                    throw new error_handler_middleware_1.AppError("QR code not generated for this summary", 404);
                }
                res.status(200).json({
                    status: "success",
                    data: {
                        qrCode: summary.qrCode,
                        summaryId: summary._id,
                    },
                });
            }
            catch (error) {
                next(error);
            }
        };
        // Verify QR code
        this.verifyQR = async (req, res, next) => {
            try {
                const { qrCode } = req.body;
                // Parse QR code data
                const qrData = JSON.parse(qrCode);
                // Find summary
                const summary = await AISummary_model_1.AISummary.findById(qrData.summaryId).populate("createdBy", "name userType");
                if (!summary) {
                    throw new error_handler_middleware_1.AppError("Invalid QR code", 400);
                }
                // Verify timestamp (QR code expires after 24 hours)
                const qrAge = Date.now() - qrData.timestamp;
                if (qrAge > 24 * 60 * 60 * 1000) {
                    throw new error_handler_middleware_1.AppError("QR code has expired", 400);
                }
                res.status(200).json({
                    status: "success",
                    data: summary,
                });
            }
            catch (error) {
                next(error);
            }
        };
        this.generateQRCode = async (req, res, next) => {
            try {
                const { userId } = req.params;
                const qrData = { userId, timestamp: Date.now() };
                const qrCode = await qrcode_1.default.toDataURL(JSON.stringify(qrData));
                res.status(200).json({
                    status: "success",
                    data: { qrCode },
                });
            }
            catch (error) {
                next(error);
            }
        };
        this.scanQRCode = async (req, res, next) => {
            try {
                const { qrData } = req.body;
                const data = JSON.parse(qrData);
                res.status(200).json({
                    status: "success",
                    data,
                });
            }
            catch (error) {
                next(error);
            }
        };
        this.getQRCodeHistory = async (req, res, next) => {
            try {
                const { userId } = req.params;
                res.status(200).json({
                    status: "success",
                    data: [],
                });
            }
            catch (error) {
                next(error);
            }
        };
    }
}
exports.qrController = new QRController();
//# sourceMappingURL=qr.controller.js.map