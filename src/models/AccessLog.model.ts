import mongoose, { Document, Schema } from 'mongoose';

export interface IAccessLog extends Document {
  doctorId: mongoose.Types.ObjectId;
  patientId: mongoose.Types.ObjectId;
  accessType: 'qr_scan' | 'sehat_id_search';
  ipAddress: string;
  userAgent: string;
  accessedAt: Date;
}

const accessLogSchema = new Schema<IAccessLog>(
  {
    doctorId: {
      type: Schema.Types.ObjectId,
      ref: 'Doctor',
      required: [true, 'Doctor ID is required']
    },
    patientId: {
      type: Schema.Types.ObjectId,
      ref: 'Patient',
      required: [true, 'Patient ID is required']
    },
    accessType: {
      type: String,
      enum: ['qr_scan', 'sehat_id_search'],
      required: [true, 'Access type is required']
    },
    ipAddress: {
      type: String,
      required: [true, 'IP address is required']
    },
    userAgent: {
      type: String,
      required: [true, 'User agent is required']
    },
    accessedAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true,
    toJSON: {
      transform: (_, ret) => {
        delete ret.__v;
        return ret;
      }
    }
  }
);

// Indexes
accessLogSchema.index({ doctorId: 1 });
accessLogSchema.index({ patientId: 1 });
accessLogSchema.index({ accessType: 1 });
accessLogSchema.index({ accessedAt: -1 });

export const AccessLog = mongoose.model<IAccessLog>('AccessLog', accessLogSchema); 