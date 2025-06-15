import { Request, Response } from "express";
import { GoogleGenAI } from "@google/genai";
import { AISummary } from "../models/AISummary.model";
import { uploadToCloudinary } from "../utils/cloudinary";
import fs from "fs";
import { AppError } from "../middleware/error-handler.middleware";
import * as pdfjs from "pdfjs-dist";
import { User } from "../models/User.model";

// Initialize Gemini
const genAI = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || "",
});

const model = "gemini-2.5-flash-preview-04-17";
const config = {
  responseMimeType: "text/plain",
};

// Helper function to convert PDF to base64
async function convertPdfToBase64(filePath: string): Promise<string> {
  const data = fs.readFileSync(filePath);
  return data.toString("base64");
}

export const processPrescriptionImage = async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      throw new AppError("No file provided", 400);
    }

    // Read file and convert to base64
    const base64Data = await convertPdfToBase64(req.file.path);

    // Process with Gemini
    const contents = [
      {
        role: "user",
        parts: [
          {
            text:
              "Analyze the prescription document and extract the relevant data. Return ONLY a raw JSON object without any markdown formatting, code blocks, or additional text.\n\n" +
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
      throw new AppError("Invalid response from AI model", 500);
    }

    const fullResponse = response.candidates[0].content.parts[0].text;
    const cleanedResponse = fullResponse
      .replace(/```json\n?/g, "")
      .replace(/```\n?/g, "")
      .trim();

    let extractedData;
    try {
      extractedData = JSON.parse(cleanedResponse);
    } catch (error: any) {
      console.error("Raw response:", cleanedResponse);
      throw new AppError(`Failed to parse AI response: ${error.message}`, 500);
    }

    // Create AI summary
    const aiSummary = await AISummary.create({
      createdBy: req.user._id,
      summary: extractedData.summary,
      keyMedications: extractedData.keyMedications,
      dosages: extractedData.dosages,
      warnings: extractedData.warnings,
      recommendations: extractedData.recommendations,
      confidence: extractedData.confidence,
    });

    // Clean up: Delete the temporary file
    fs.unlinkSync(req.file.path);

    return res.status(201).json({
      status: "success",
      data: aiSummary,
    });
  } catch (error) {
    // Clean up: Delete the temporary file in case of error
    if (req.file?.path) {
      fs.unlinkSync(req.file.path);
    }

    console.error("Error processing prescription:", error);
    throw error;
  }
};

export const getOverallSummary = async (req: Request, res: Response) => {
  try {
    const { sehatId } = req.params;
    // console.log({ sehatId });

    // First find the user by sehatId
    const user = await User.findOne({ sehatId });
    if (!user) {
      throw new AppError("Patient not found", 404);
    }

    // Then find all summaries created for this user
    const summaries = await AISummary.find({ createdBy: user._id })
      .sort({ createdAt: -1 })
      .populate("createdBy", "name userType");

    // Prepare data for Gemini
    const summaryTexts = summaries
      .map((summary) => summary.summary)
      .join("\n\n");

    // Get AI summary from Gemini

    // Initialize Gemini
    const genAI = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY || "",
    });

    const model = "gemini-2.5-flash-preview-04-17";
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
      throw new AppError("Invalid response from AI model", 500);
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
  } catch (error) {
    throw error;
  }
};

export const getSummary = async (req: Request, res: Response) => {
  try {
    const { summaryId } = req.params;

    const summary = await AISummary.findById(summaryId).populate(
      "createdBy",
      "name userType"
    );

    if (!summary) {
      throw new AppError("Summary not found", 404);
    }

    return res.status(200).json({
      status: "success",
      data: summary,
    });
  } catch (error) {
    throw error;
  }
};

export const getUserSummaries = async (req: Request, res: Response) => {
  try {
    const summaries = await AISummary.find({ createdBy: req.user._id })
      .sort({ createdAt: -1 })
      .populate("createdBy", "name userType");

    return res.status(200).json({
      status: "success",
      data: summaries,
    });
  } catch (error) {
    throw error;
  }
};

export const updateSummary = async (req: Request, res: Response) => {
  try {
    const { summaryId } = req.params;
    const updateData = req.body;

    const summary = await AISummary.findOneAndUpdate(
      { _id: summaryId, createdBy: req.user._id },
      { $set: updateData },
      { new: true, runValidators: true }
    );

    if (!summary) {
      throw new AppError("Summary not found or unauthorized", 404);
    }

    return res.status(200).json({
      status: "success",
      data: summary,
    });
  } catch (error) {
    throw error;
  }
};

export const deleteSummary = async (req: Request, res: Response) => {
  try {
    const { summaryId } = req.params;

    const summary = await AISummary.findOneAndDelete({
      _id: summaryId,
      createdBy: req.user._id,
    });

    if (!summary) {
      throw new AppError("Summary not found or unauthorized", 404);
    }

    return res.status(204).json({
      status: "success",
      data: null,
    });
  } catch (error) {
    throw error;
  }
};

export const getPatientSummaries = async (req: Request, res: Response) => {
  try {
    const { sehatId } = req.params;
    // console.log({ sehatId });

    // First find the user by sehatId
    const user = await User.findOne({ sehatId });
    if (!user) {
      throw new AppError("Patient not found", 404);
    }

    // Add patient to doctor's examined patients if not already added
    if (req.user && req.user.userType === "doctor") {
      await User.findByIdAndUpdate(
        req.user._id,
        { $addToSet: { patientsExamined: user._id } },
        { new: true }
      );
    }

    // Then find all summaries created for this user
    const summaries = await AISummary.find({ createdBy: user._id })
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
  } catch (error) {
    throw error;
  }
};

export const getAllPatientByDoctor = async (req: Request, res: Response) => {
  try {
    const doctorId = req.user._id;

    // Get all patients that this doctor has examined
    const doctor = await User.findById(doctorId).populate({
      path: "patientsExamined",
      select: "name sehatId dateOfBirth gender",
    });

    if (!doctor) {
      throw new AppError("Doctor not found", 404);
    }

    // Transform the data to include last viewed time and view count
    const patients = (doctor.patientsExamined || []).map((patient: any) => ({
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
  } catch (error) {
    throw error;
  }
};

export const createManualSummary = async (req: Request, res: Response) => {
  try {
    const {
      sehatId,
      summary,
      keyMedications,
      dosages,
      warnings,
      recommendations,
      confidence,
    } = req.body;

    // Find the patient by sehatId
    const patient = await User.findOne({ sehatId });
    if (!patient) {
      throw new AppError("Patient not found", 404);
    }

    // Add patient to doctor's examined patients if not already added
    if (req.user.userType === "doctor") {
      await User.findByIdAndUpdate(
        req.user._id,
        { $addToSet: { patientsExamined: patient._id } },
        { new: true }
      );
    }

    // Create AI summary with doctor as creator
    const aiSummary = await AISummary.create({
      createdBy: req.user._id,
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
  } catch (error) {
    throw error;
  }
};
