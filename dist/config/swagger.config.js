"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.swaggerSpec = void 0;
const swagger_jsdoc_1 = __importDefault(require("swagger-jsdoc"));
const app_config_1 = require("./app.config");
const options = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "Prescription AI API",
            version: "1.0.0",
            description: "API documentation for the Prescription AI backend",
            contact: {
                name: "API Support",
                email: "support@prescription-ai.com",
            },
        },
        servers: [
            {
                url: `http://localhost:${app_config_1.appConfig.port}`,
                description: "Development server",
            },
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: "http",
                    scheme: "bearer",
                    bearerFormat: "JWT",
                },
            },
        },
        security: [
            {
                bearerAuth: [],
            },
        ],
    },
    apis: ["./src/routes/*.ts", "./src/models/*.ts"], // Path to the API routes and models
};
exports.swaggerSpec = (0, swagger_jsdoc_1.default)(options);
//# sourceMappingURL=swagger.config.js.map