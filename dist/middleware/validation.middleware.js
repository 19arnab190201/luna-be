"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateRequest = void 0;
const express_validator_1 = require("express-validator");
const error_handler_middleware_1 = require("./error-handler.middleware");
const validateRequest = (req, res, next) => {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        throw new error_handler_middleware_1.AppError(errors.array()[0].msg, 400);
    }
    next();
};
exports.validateRequest = validateRequest;
//# sourceMappingURL=validation.middleware.js.map