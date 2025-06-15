import express from "express";
import {
  processPrescriptionImage,
  getSummary,
  getUserSummaries,
  updateSummary,
  deleteSummary,
  getPatientSummaries,
  getOverallSummary,
  getAllPatientByDoctor,
  createManualSummary,
} from "../controllers/ai.controller";
import { authMiddleware } from "../middleware/auth.middleware";
import { uploadPrescription } from "../middleware/upload.middleware";

const router = express.Router();

// Process prescription image and create summary
router.post(
  "/process",
  authMiddleware,
  uploadPrescription,
  processPrescriptionImage,
  getPatientSummaries
);

// Get all summaries for the current user
router.get("/summaries", authMiddleware, getUserSummaries);

// Get all summaries for a patient by sehatId
router.get("/:sehatId/summaries", authMiddleware, getPatientSummaries);

// Get overall summary for a patient by sehatId
router.get("/:sehatId/overall-summary", getOverallSummary);

// Get a specific summary
router.get("/summaries/:summaryId", authMiddleware, getSummary);

// Update a summary
router.patch("/summaries/:summaryId", authMiddleware, updateSummary);

// Delete a summary
router.delete("/summaries/:summaryId", authMiddleware, deleteSummary);

// Get patients examined by doctors
router.get("/doctor/patients", authMiddleware, getAllPatientByDoctor);

// Create manual summary
router.post("/manual-summary", authMiddleware, createManualSummary);

export default router;
