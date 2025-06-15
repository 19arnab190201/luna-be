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
exports.AISummary = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const aiSummarySchema = new mongoose_1.Schema({
    createdBy: {
        type: mongoose_1.Schema.Types.ObjectId,
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
    cloudinaryUrl: {
        type: String,
    },
}, {
    timestamps: true,
    toJSON: {
        transform: (_, ret) => {
            delete ret.__v;
            return ret;
        },
    },
});
// Indexes
aiSummarySchema.index({ prescriptionId: 1 });
aiSummarySchema.index({ generatedAt: -1 });
aiSummarySchema.index({ confidence: -1 });
exports.AISummary = mongoose_1.default.model("AISummary", aiSummarySchema);
//# sourceMappingURL=AISummary.model.js.map