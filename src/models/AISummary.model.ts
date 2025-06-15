import mongoose, { Document, Schema } from "mongoose";

export interface IAISummary extends Document {
  createdBy: mongoose.Types.ObjectId;
  summary: string;
  keyMedications: string[];
  dosages: string[];
  warnings?: string[];
  recommendations?: string[];
  confidence: number;
  generatedAt: Date;
  version: number;
  qrCode?: string;
}

const aiSummarySchema = new Schema<IAISummary>(
  {
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User ID is required"],
    },
    summary: {
      type: String,
      required: [true, "Summary is required"],
    },
    keyMedications: [
      {
        type: String,
        required: [true, "Key medications are required"],
      },
    ],
    dosages: [
      {
        type: String,
        required: [true, "Dosages are required"],
      },
    ],
    warnings: [
      {
        type: String,
      },
    ],
    recommendations: [
      {
        type: String,
      },
    ],
    confidence: {
      type: Number,
      required: [true, "Confidence score is required"],
      min: 0,
      max: 1,
    },
    generatedAt: {
      type: Date,
      default: Date.now,
    },
    version: {
      type: Number,
      default: 1,
    },
    qrCode: {
      type: String,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (_, ret) => {
        delete ret.__v;
        return ret;
      },
    },
  }
);

// Indexes
aiSummarySchema.index({ prescriptionId: 1 });
aiSummarySchema.index({ generatedAt: -1 });
aiSummarySchema.index({ confidence: -1 });
export const AISummary = mongoose.model<IAISummary>(
  "AISummary",
  aiSummarySchema
);
