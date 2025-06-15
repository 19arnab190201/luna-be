"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const dotenv_1 = __importDefault(require("dotenv"));
const express_rate_limit_1 = require("express-rate-limit");
const mongoose_1 = __importDefault(require("mongoose"));
// Load environment variables
dotenv_1.default.config();
// Import routes
const auth_routes_1 = require("./routes/auth.routes");
const qr_routes_1 = __importDefault(require("./routes/qr.routes"));
const ai_routes_1 = __importDefault(require("./routes/ai.routes"));
// Import middleware
const error_handler_middleware_1 = require("./middleware/error-handler.middleware");
const morgan_1 = __importDefault(require("morgan"));
const app = (0, express_1.default)();
// Trust proxy
app.set("trust proxy", 1);
// Security middleware
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
// Rate limiting
const limiter = (0, express_rate_limit_1.rateLimit)({
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || "900000"),
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || "100"),
    message: "Too many requests from this IP, please try again later.",
});
app.use(limiter);
//Morgan logger
app.use((0, morgan_1.default)("dev"));
// Routes
app.use("/api/v1/auth", auth_routes_1.authRoutes);
app.use("/api/v1/qr", qr_routes_1.default);
app.use("/api/v1/ai", ai_routes_1.default);
// Error handling
app.use(error_handler_middleware_1.errorHandler);
// Database connection
mongoose_1.default
    .connect(process.env.MONGODB_URI || "")
    .then(() => {
    console.log("Connected to MongoDB");
})
    .catch((error) => {
    console.error("MongoDB connection error:", error);
    process.exit(1);
});
// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
exports.default = app;
//# sourceMappingURL=app.js.map