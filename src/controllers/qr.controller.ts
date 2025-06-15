import { Request, Response, NextFunction } from "express";
import { AppError } from "../middleware/error-handler.middleware";
import QRCode from "qrcode";
import { AISummary } from "../models/AISummary.model";

class QRController {
  // Generate QR code for prescription
  generateQR = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { summaryId } = req.params;

      const summary = await AISummary.findById(summaryId);
      if (!summary) {
        throw new AppError("Summary not found", 404);
      }

      // Generate unique QR code data
      const qrData = {
        summaryId: summary._id,
        timestamp: Date.now(),
      };

      // Generate QR code
      const qrCode = await QRCode.toDataURL(JSON.stringify(qrData));

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
    } catch (error) {
      next(error);
    }
  };

  // Get QR code for prescription
  getQR = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { summaryId } = req.params;

      const summary = await AISummary.findById(summaryId);
      if (!summary) {
        throw new AppError("Summary not found", 404);
      }

      if (!summary.qrCode) {
        throw new AppError("QR code not generated for this summary", 404);
      }

      res.status(200).json({
        status: "success",
        data: {
          qrCode: summary.qrCode,
          summaryId: summary._id,
        },
      });
    } catch (error) {
      next(error);
    }
  };

  // Verify QR code
  verifyQR = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { qrCode } = req.body;

      // Parse QR code data
      const qrData = JSON.parse(qrCode);

      // Find summary
      const summary = await AISummary.findById(qrData.summaryId).populate(
        "createdBy",
        "name userType"
      );

      if (!summary) {
        throw new AppError("Invalid QR code", 400);
      }

      // Verify timestamp (QR code expires after 24 hours)
      const qrAge = Date.now() - qrData.timestamp;
      if (qrAge > 24 * 60 * 60 * 1000) {
        throw new AppError("QR code has expired", 400);
      }

      res.status(200).json({
        status: "success",
        data: summary,
      });
    } catch (error) {
      next(error);
    }
  };

  generateQRCode = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { userId } = req.params;
      const qrData = { userId, timestamp: Date.now() };
      const qrCode = await QRCode.toDataURL(JSON.stringify(qrData));

      res.status(200).json({
        status: "success",
        data: { qrCode },
      });
    } catch (error) {
      next(error);
    }
  };

  scanQRCode = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { qrData } = req.body;
      const data = JSON.parse(qrData);

      res.status(200).json({
        status: "success",
        data,
      });
    } catch (error) {
      next(error);
    }
  };

  getQRCodeHistory = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { userId } = req.params;

      res.status(200).json({
        status: "success",
        data: [],
      });
    } catch (error) {
      next(error);
    }
  };
}

export const qrController = new QRController();
