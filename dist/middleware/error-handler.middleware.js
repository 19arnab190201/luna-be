"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = exports.AppError = void 0;
class AppError extends Error {
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
        this.status = `${statusCode}`.startsWith("4") ? "fail" : "error";
        this.isOperational = true;
        Error.captureStackTrace(this, this.constructor);
    }
}
exports.AppError = AppError;
const errorHandler = (err, req, res, next) => {
    if (err instanceof AppError) {
        return res.status(err.statusCode).json({
            status: err.status,
            message: err.message,
            ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
        });
    }
    // Handle mongoose validation errors
    if (err.name === "ValidationError") {
        return res.status(400).json({
            status: "fail",
            message: err.message,
        });
    }
    // Handle mongoose duplicate key errors
    if (err.name === "MongoError" && err.code === 11000) {
        return res.status(400).json({
            status: "fail",
            message: "Duplicate field value entered",
        });
    }
    // Handle JWT errors
    if (err.name === "JsonWebTokenError") {
        return res.status(401).json({
            status: "fail",
            message: "Invalid token. Please log in again.",
        });
    }
    if (err.name === "TokenExpiredError") {
        return res.status(401).json({
            status: "fail",
            message: "Your token has expired. Please log in again.",
        });
    }
    // Default error
    console.error("ERROR 💥", err);
    return res.status(500).json({
        status: "error",
        message: "Something went wrong",
        ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
    });
};
exports.errorHandler = errorHandler;
//# sourceMappingURL=error-handler.middleware.js.map