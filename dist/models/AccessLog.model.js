"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.AccessLog = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const accessLogSchema = new mongoose_1.Schema({
    doctorId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Doctor',
        required: [true, 'Doctor ID is required']
    },
    patientId: {
        type: mongoose_1.Schema.Types.ObjectId,
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
}, {
    timestamps: true,
    toJSON: {
        transform: (_, ret) => {
            delete ret.__v;
            return ret;
        }
    }
});
// Indexes
accessLogSchema.index({ doctorId: 1 });
accessLogSchema.index({ patientId: 1 });
accessLogSchema.index({ accessType: 1 });
accessLogSchema.index({ accessedAt: -1 });
exports.AccessLog = mongoose_1.default.model('AccessLog', accessLogSchema);
//# sourceMappingURL=AccessLog.model.js.map