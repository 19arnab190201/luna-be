"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const ai_controller_1 = require("../controllers/ai.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const upload_middleware_1 = require("../middleware/upload.middleware");
const router = express_1.default.Router();
// Process prescription image and create summary
router.post("/process", auth_middleware_1.authMiddleware, upload_middleware_1.uploadPrescription, ai_controller_1.processPrescriptionImage, ai_controller_1.getPatientSummaries);
// Get all summaries for the current user
router.get("/summaries", auth_middleware_1.authMiddleware, ai_controller_1.getUserSummaries);
// Get all summaries for a patient by sehatId
router.get("/:sehatId/summaries", auth_middleware_1.authMiddleware, ai_controller_1.getPatientSummaries);
// Get overall summary for a patient by sehatId
router.get("/:sehatId/overall-summary", ai_controller_1.getOverallSummary);
// Get a specific summary
router.get("/summaries/:summaryId", auth_middleware_1.authMiddleware, ai_controller_1.getSummary);
// Update a summary
router.patch("/summaries/:summaryId", auth_middleware_1.authMiddleware, ai_controller_1.updateSummary);
// Delete a summary
router.delete("/summaries/:summaryId", auth_middleware_1.authMiddleware, ai_controller_1.deleteSummary);
// Get patients examined by doctors
router.get("/doctor/patients", auth_middleware_1.authMiddleware, ai_controller_1.getAllPatientByDoctor);
// Create manual summary
router.post("/manual-summary", auth_middleware_1.authMiddleware, ai_controller_1.createManualSummary);
exports.default = router;
//# sourceMappingURL=ai.routes.js.map