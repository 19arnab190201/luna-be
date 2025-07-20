"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createManualSummary = exports.getAllPatientByDoctor = exports.getPatientSummaries = exports.deleteSummary = exports.updateSummary = exports.getUserSummaries = exports.getSummary = exports.getOverallSummary = exports.processPrescriptionImage = void 0;
const genai_1 = require("@google/genai");
const AISummary_model_1 = require("../models/AISummary.model");
const error_handler_middleware_1 = require("../middleware/error-handler.middleware");
const User_model_1 = require("../models/User.model");
const cloudinary_1 = require("cloudinary");
// Configure Cloudinary
cloudinary_1.v2.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});
// Initialize Gemini
const genAI = new genai_1.GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY || "",
});
const model = process.env.GEMINI_MODEL || "gemini-2.0-flash-live-001";
const config = {
    responseMimeType: "text/plain",
};
// Helper function to convert buffer to base64
function bufferToBase64(buffer) {
    return buffer.toString("base64");
}
const processPrescriptionImage = async (req, res) => {
    try {
        if (!req.file) {
            throw new error_handler_middleware_1.AppError("No file provided", 400);
        }
        // Upload to Cloudinary
        const b64 = bufferToBase64(req.file.buffer);
        const dataURI = `data:${req.file.mimetype};base64,${b64}`;
        const cloudinaryResponse = await cloudinary_1.v2.uploader.upload(dataURI, {
            folder: "prescriptions",
            resource_type: "auto",
        });
        // Convert buffer to base64 for Gemini
        const base64Data = bufferToBase64(req.file.buffer);
        // Process with Gemini
        const contents = [
            {
                role: "user",
                parts: [
                    {
                        text: "Analyze the prescription document and extract the relevant data. Return ONLY a raw JSON object without any markdown formatting, code blocks, or additional text.\n\n" +
                            "REQUIRED JSON FORMAT:\n" +
                            "{\n" +
                            '  "summary": "Brief summary of the prescription and diagnosis",\n' +
                            '  "keyMedications": ["List of key medication names"],\n' +
                            '  "dosages": ["List of dosages corresponding to the medications, e.g., 500mg twice a day"],\n' +
                            '  "warnings": ["Any warnings, precautions, or notable side effects (if any)"],\n' +
                            '  "recommendations": ["Doctor\'s recommendations or follow-up actions (if mentioned)"],\n' +
                            '  "confidence": 0.0 to 1.0 (model\'s confidence in the accuracy of the extraction)\n' +
                            "}",
                    },
                    {
                        inlineData: {
                            mimeType: req.file.mimetype,
                            data: base64Data,
                        },
                    },
                ],
            },
        ];
        const response = await genAI.models.generateContent({
            model,
            config,
            contents,
        });
        if (!response.candidates?.[0]?.content?.parts?.[0]?.text) {
            throw new error_handler_middleware_1.AppError("Invalid response from AI model", 500);
        }
        const fullResponse = response.candidates[0].content.parts[0].text;
        const cleanedResponse = fullResponse
            .replace(/```json\n?/g, "")
            .replace(/```\n?/g, "")
            .trim();
        let extractedData;
        try {
            extractedData = JSON.parse(cleanedResponse);
        }
        catch (error) {
            console.error("Raw response:", cleanedResponse);
            throw new error_handler_middleware_1.AppError(`Failed to parse AI response: ${error.message}`, 500);
        }
        // Create AI summary
        const aiSummary = await AISummary_model_1.AISummary.create({
            createdBy: req.user._id,
            summary: extractedData.summary,
            keyMedications: extractedData.keyMedications,
            dosages: extractedData.dosages,
            warnings: extractedData.warnings,
            recommendations: extractedData.recommendations,
            confidence: extractedData.confidence,
            cloudinaryUrl: cloudinaryResponse.secure_url, // Store the Cloudinary URL
        });
        return res.status(201).json({
            status: "success",
            data: aiSummary,
        });
    }
    catch (error) {
        console.error("Error processing prescription:", error);
        throw error;
    }
};
exports.processPrescriptionImage = processPrescriptionImage;
const getOverallSummary = async (req, res) => {
    try {
        const { sehatId } = req.params;
        // console.log({ sehatId });
        // First find the user by sehatId
        const user = await User_model_1.User.findOne({ sehatId });
        if (!user) {
            throw new error_handler_middleware_1.AppError("Patient not found", 404);
        }
        // Then find all summaries created for this user
        const summaries = await AISummary_model_1.AISummary.find({ createdBy: user._id })
            .sort({ createdAt: -1 })
            .populate("createdBy", "name userType");
        // Prepare data for Gemini
        const summaryTexts = summaries
            .map((summary) => summary.summary)
            .join("\n\n");
        // Get AI summary from Gemini
        // Initialize Gemini
        const genAI = new genai_1.GoogleGenAI({
            apiKey: process.env.GEMINI_API_KEY || "",
        });
        const model = process.env.GEMINI_MODEL || "gemini-2.0-flash-live-001";
        const config = {
            responseMimeType: "text/plain",
        };
        const response = await genAI.models.generateContent({
            model,
            config,
            contents: [
                {
                    role: "user",
                    parts: [
                        {
                            text: `Generate a concise medical history summary from the provided prescription records. Treat all entries as belonging to the same patient, even if the names differ. Do not include any names in the summary. The summary must start directly with "The patient..." and remain within a 200-word limit. Avoid bullet points, headings, or formatting. Focus on key diagnoses, medications, treatments, and any observable progression or changes over time.: \n\n${summaryTexts}`,
                        },
                    ],
                },
            ],
        });
        if (!response.candidates?.[0]?.content?.parts?.[0]?.text) {
            throw new error_handler_middleware_1.AppError("Invalid response from AI model", 500);
        }
        const overallSummary = response.candidates[0].content.parts[0].text;
        return res.status(200).json({
            status: "success",
            data: {
                patient: {
                    name: user.name,
                    sehatId: user.sehatId,
                    userType: user.userType,
                    dateOfBirth: user.dateOfBirth,
                    gender: user.gender,
                },
                overallSummary,
            },
        });
    }
    catch (error) {
        throw error;
    }
};
exports.getOverallSummary = getOverallSummary;
const getSummary = async (req, res) => {
    try {
        const { summaryId } = req.params;
        const summary = await AISummary_model_1.AISummary.findById(summaryId).populate("createdBy", "name userType");
        if (!summary) {
            throw new error_handler_middleware_1.AppError("Summary not found", 404);
        }
        return res.status(200).json({
            status: "success",
            data: summary,
        });
    }
    catch (error) {
        throw error;
    }
};
exports.getSummary = getSummary;
const getUserSummaries = async (req, res) => {
    try {
        const summaries = await AISummary_model_1.AISummary.find({ createdBy: req.user._id })
            .sort({ createdAt: -1 })
            .populate("createdBy", "name userType");
        return res.status(200).json({
            status: "success",
            data: summaries,
        });
    }
    catch (error) {
        throw error;
    }
};
exports.getUserSummaries = getUserSummaries;
const updateSummary = async (req, res) => {
    try {
        const { summaryId } = req.params;
        const updateData = req.body;
        const summary = await AISummary_model_1.AISummary.findOneAndUpdate({ _id: summaryId, createdBy: req.user._id }, { $set: updateData }, { new: true, runValidators: true });
        if (!summary) {
            throw new error_handler_middleware_1.AppError("Summary not found or unauthorized", 404);
        }
        return res.status(200).json({
            status: "success",
            data: summary,
        });
    }
    catch (error) {
        throw error;
    }
};
exports.updateSummary = updateSummary;
const deleteSummary = async (req, res) => {
    try {
        const { summaryId } = req.params;
        const summary = await AISummary_model_1.AISummary.findOneAndDelete({
            _id: summaryId,
            createdBy: req.user._id,
        });
        if (!summary) {
            throw new error_handler_middleware_1.AppError("Summary not found or unauthorized", 404);
        }
        return res.status(204).json({
            status: "success",
            data: null,
        });
    }
    catch (error) {
        throw error;
    }
};
exports.deleteSummary = deleteSummary;
const getPatientSummaries = async (req, res) => {
    try {
        const { sehatId } = req.params;
        // console.log({ sehatId });
        // First find the user by sehatId
        const user = await User_model_1.User.findOne({ sehatId });
        if (!user) {
            throw new error_handler_middleware_1.AppError("Patient not found", 404);
        }
        // Add patient to doctor's examined patients if not already added
        if (req.user && req.user.userType === "doctor") {
            await User_model_1.User.findByIdAndUpdate(req.user._id, { $addToSet: { patientsExamined: user._id } }, { new: true });
        }
        // Then find all summaries created for this user
        const summaries = await AISummary_model_1.AISummary.find({ createdBy: user._id })
            .sort({ createdAt: -1 })
            .populate("createdBy", "name userType");
        // Return both patient data and summaries
        return res.status(200).json({
            status: "success",
            data: {
                patient: {
                    name: user.name,
                    sehatId: user.sehatId,
                    userType: user.userType,
                    dateOfBirth: user.dateOfBirth,
                    gender: user.gender,
                },
                summaries: summaries,
            },
        });
    }
    catch (error) {
        throw error;
    }
};
exports.getPatientSummaries = getPatientSummaries;
const getAllPatientByDoctor = async (req, res) => {
    try {
        const doctorId = req.user._id;
        // Get all patients that this doctor has examined
        const doctor = await User_model_1.User.findById(doctorId).populate({
            path: "patientsExamined",
            select: "name sehatId dateOfBirth gender",
        });
        if (!doctor) {
            throw new error_handler_middleware_1.AppError("Doctor not found", 404);
        }
        // Transform the data to include last viewed time and view count
        const patients = (doctor.patientsExamined || []).map((patient) => ({
            _id: patient._id,
            name: patient.name,
            sehatId: patient.sehatId,
            dateOfBirth: patient.dateOfBirth,
            gender: patient.gender,
            lastViewedAt: patient.lastViewedAt || new Date(),
            viewCount: patient.viewCount || 1,
        }));
        return res.status(200).json({
            status: "success",
            data: patients,
        });
    }
    catch (error) {
        throw error;
    }
};
exports.getAllPatientByDoctor = getAllPatientByDoctor;
const createManualSummary = async (req, res) => {
    try {
        const { sehatId, summary, keyMedications, dosages, warnings, recommendations, confidence, } = req.body;
        // Find the patient by sehatId
        const patient = await User_model_1.User.findOne({ sehatId });
        if (!patient) {
            throw new error_handler_middleware_1.AppError("Patient not found", 404);
        }
        // Add patient to doctor's examined patients if not already added
        if (req.user.userType === "doctor") {
            await User_model_1.User.findByIdAndUpdate(req.user._id, { $addToSet: { patientsExamined: patient._id } }, { new: true });
        }
        // Create AI summary with doctor as creator
        const aiSummary = await AISummary_model_1.AISummary.create({
            createdBy: patient._id,
            summary,
            keyMedications,
            dosages,
            warnings,
            recommendations,
            confidence: confidence || 1.0, // Default to 1.0 for manual entries
        });
        return res.status(201).json({
            status: "success",
            data: aiSummary,
        });
    }
    catch (error) {
        throw error;
    }
};
exports.createManualSummary = createManualSummary;
//# sourceMappingURL=ai.controller.js.map