import { Document } from "mongoose";
import mongoose from "mongoose";

export interface IUser extends Document {
  name: string;
  sehatId: string;
  phoneNumber: string;
  userType: "patient" | "doctor" | "admin";
  dateOfBirth?: Date;
  gender?: "male" | "female";
  isPhoneVerified: boolean;
  isActive: boolean;
  lastLogin: Date;
  password?: string;
  patientsExamined?: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

export interface IPatient extends Document {
  user: IUser["_id"];
  name: string;
  dateOfBirth: Date;
  gender: "male" | "female" | "other";
  address: string;
  medicalHistory: string[];
  prescriptions: IPrescription["_id"][];
  createdAt: Date;
  updatedAt: Date;
}

export interface IDoctor extends Document {
  user: IUser["_id"];
  name: string;
  specialization: string;
  licenseNumber: string;
  hospital: string;
  prescriptions: IPrescription["_id"][];
  createdAt: Date;
  updatedAt: Date;
}

export interface IPrescription extends Document {
  patient: mongoose.Types.ObjectId;
  doctor: IDoctor["_id"];
  diagnosis: string;
  medications: {
    name: string;
    dosage: string;
    frequency: string;
    duration: string;
  }[];
  notes?: string;
  prescriptionImage?: string;
  qrCode?: string;
  status: "active" | "completed" | "cancelled";
  aiSummary?: {
    summary: string;
    keyMedications: string[];
    dosages: string[];
    warnings: string[];
    recommendations: string[];
    confidence: number;
  };
  createdAt?: Date;
  updatedAt?: Date;
}
