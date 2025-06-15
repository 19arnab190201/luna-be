"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.stream = exports.logger = void 0;
const winston_1 = __importDefault(require("winston"));
const app_config_1 = require("./app.config");
// Define log format
const logFormat = winston_1.default.format.combine(winston_1.default.format.timestamp(), winston_1.default.format.errors({ stack: true }), winston_1.default.format.splat(), winston_1.default.format.json());
// Create logger instance
exports.logger = winston_1.default.createLogger({
    level: app_config_1.appConfig.logging.level,
    format: logFormat,
    transports: [
        // Write all logs to console
        new winston_1.default.transports.Console({
            format: winston_1.default.format.combine(winston_1.default.format.colorize(), winston_1.default.format.simple()),
        }),
        // Write all logs with level 'error' and below to error.log
        new winston_1.default.transports.File({
            filename: "logs/error.log",
            level: "error",
        }),
        // Write all logs with level 'info' and below to combined.log
        new winston_1.default.transports.File({
            filename: "logs/combined.log",
        }),
    ],
});
// Create a stream object for Morgan
exports.stream = {
    write: (message) => {
        exports.logger.info(message.trim());
    },
};
//# sourceMappingURL=logger.config.js.map