import mongoose, { Document, Schema } from "mongoose";

export interface IOTPSession extends Document {
  phoneNumber: string;
  otp: string;
  expiresAt: Date;
  createdAt: Date;
}

const OTPSessionSchema = new Schema<IOTPSession>({
  phoneNumber: {
    type: String,
    required: true,
    index: true,
  },
  otp: {
    type: String,
    required: true,
  },
  expiresAt: {
    type: Date,
    required: true,
    index: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 600, // Automatically delete documents after 10 minutes
  },
});

export const OTPSession = mongoose.model<IOTPSession>(
  "OTPSession",
  OTPSessionSchema
);
