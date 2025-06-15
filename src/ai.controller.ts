import { Request, Response } from "express";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { AISummary } from "./models/AISummary.model";
import { uploadToCloudinary } from "./utils/cloudinary";
import fs from "fs";

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
const model = genAI.getGenerativeModel({ model: "gemini-pro-vision" });

export const processPrescriptionImage = async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No image file provided" });
    }

    // Upload image to Cloudinary
    const imageUrl = await uploadToCloudinary(req.file.path);

    // Read file for Gemini processing
    const imageBuffer = fs.readFileSync(req.file.path);
    const base64Image = imageBuffer.toString("base64");

    // Process image with Gemini
    const result = await model.generateContent([
      "Analyze the prescription image and extract the relevant data in the exact JSON format provided below.\n\n" +
        "STRICT INSTRUCTIONS:\n" +
        "- Return ONLY the JSON object.\n" +
        "- Do NOT include mockups, examples, explanations, or any extra text.\n" +
        "- Use empty arrays if any fields are not available.\n\n" +
        "REQUIRED JSON FORMAT:\n" +
        "{\n" +
        '  "summary": "Brief summary of the prescription and diagnosis",\n' +
        '  "keyMedications": ["List of key medication names"],\n' +
        '  "dosages": ["List of dosages corresponding to the medications, e.g., 500mg twice a day"],\n' +
        '  "warnings": ["Any warnings, precautions, or notable side effects (if any)"],\n' +
        '  "recommendations": ["Doctor\'s recommendations or follow-up actions (if mentioned)"],\n' +
        '  "confidence": 0.0 to 1.0 (model\'s confidence in the accuracy of the extraction)\n' +
        "}\n",
      {
        inlineData: {
          mimeType: "image/jpeg",
          data: base64Image,
        },
      },
    ]);

    const response = await result.response;
    const extractedData = JSON.parse(response.text());

    // Generate AI summary
    const summaryResult = await model.generateContent([
      "Based on this prescription data, provide: " +
        "1. A concise summary " +
        "2. Key medications to highlight " +
        "3. Important warnings " +
        "4. Recommendations for the patient " +
        "Format as JSON with these fields: summary, keyMedications, warnings, recommendations",
      JSON.stringify(extractedData),
    ]);

    const summaryResponse = await summaryResult.response;
    const summaryData = JSON.parse(summaryResponse.text());

    // Create AI summary
    const aiSummary = await AISummary.create({
      createdBy: req.user._id,
      summary: summaryData.summary,
      keyMedications: summaryData.keyMedications,
      dosages: extractedData.medications.map((med: any) => med.dosage),
      warnings: summaryData.warnings,
      recommendations: summaryData.recommendations,
      confidence: extractedData.confidence,
    });

    // Clean up: Delete the temporary file
    fs.unlinkSync(req.file.path);

    return res.status(201).json({
      message: "Prescription processed successfully",
      aiSummary,
    });
  } catch (error) {
    // Clean up: Delete the temporary file in case of error
    if (req.file?.path) {
      fs.unlinkSync(req.file.path);
    }

    console.error("Error processing prescription:", error);
    return res.status(500).json({
      message: "Error processing prescription",
      error: error,
    });
  }
};

export const getPrescriptionSummary = async (req: Request, res: Response) => {
  try {
    const { prescriptionId } = req.params;

    const aiSummary = await AISummary.findOne({ prescriptionId })
      .sort({ version: -1 })
      .limit(1);

    if (!aiSummary) {
      return res.status(404).json({ message: "AI summary not found" });
    }

    return res.status(200).json(aiSummary);
  } catch (error) {
    console.error("Error fetching prescription summary:", error);
    return res.status(500).json({
      message: "Error fetching prescription summary",
      error: error,
    });
  }
};
