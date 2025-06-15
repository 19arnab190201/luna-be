import swaggerJsdoc from "swagger-jsdoc";
import { appConfig } from "./app.config";

const options: swaggerJsdoc.Options = {
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
        url: `http://localhost:${appConfig.port}`,
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

export const swaggerSpec = swaggerJsdoc(options);
