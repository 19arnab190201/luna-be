# Prescription AI Backend

A Node.js backend service for processing and analyzing medical prescriptions using AI and OCR technologies.

## Features

- User authentication with phone number verification
- Patient and doctor management
- Prescription upload and processing
- OCR text extraction from prescriptions
- AI-powered prescription analysis and summarization
- QR code generation and scanning
- Access logging and audit trails
- HIPAA-compliant data handling

## Tech Stack

- Node.js
- TypeScript
- Express.js
- MongoDB
- JWT Authentication
- Google Cloud Vision API (OCR)
- OpenAI GPT (AI Analysis)
- AWS S3 (File Storage)

## Prerequisites

- Node.js (v16 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn
- Google Cloud account (for OCR)
- OpenAI API key
- AWS account (for S3)

## Installation

1. Clone the repository:
```bash
git clone https://github.com/your-username/prescription-ai-backend.git
cd prescription-ai-backend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory and add the following environment variables:
```env
# Server Configuration
PORT=3000
NODE_ENV=development

# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/prescription-ai
MONGODB_USER=
MONGODB_PASSWORD=

# JWT Configuration
JWT_SECRET=your-jwt-secret-key
JWT_EXPIRES_IN=7d
JWT_REFRESH_SECRET=your-refresh-token-secret
JWT_REFRESH_EXPIRES_IN=30d

# File Storage Configuration
UPLOAD_DIR=uploads
MAX_FILE_SIZE=5242880

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# External Services
GOOGLE_CLOUD_PROJECT_ID=
GOOGLE_CLOUD_PRIVATE_KEY=
GOOGLE_CLOUD_CLIENT_EMAIL=
OPENAI_API_KEY=
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_REGION=
AWS_BUCKET_NAME=
```

4. Create required directories:
```bash
mkdir -p uploads/prescriptions uploads/temp
```

## Development

Start the development server:
```bash
npm run dev
```

## Building for Production

Build the TypeScript code:
```bash
npm run build
```

Start the production server:
```bash
npm start
```

## Testing

Run unit tests:
```bash
npm test
```

Run integration tests:
```bash
npm run test:integration
```

## API Documentation

The API documentation is available at `/api-docs` when running the server.

### Main Endpoints

- Authentication
  - POST /api/v1/auth/register
  - POST /api/v1/auth/login
  - POST /api/v1/auth/verify-otp
  - POST /api/v1/auth/refresh-token

- Patients
  - GET /api/v1/patients
  - GET /api/v1/patients/:id
  - POST /api/v1/patients
  - PUT /api/v1/patients/:id
  - GET /api/v1/patients/:id/prescriptions

- Doctors
  - GET /api/v1/doctors
  - GET /api/v1/doctors/:id
  - POST /api/v1/doctors
  - PUT /api/v1/doctors/:id

- Prescriptions
  - POST /api/v1/prescriptions
  - GET /api/v1/prescriptions/:id
  - GET /api/v1/prescriptions/:id/summary

- QR Code
  - GET /api/v1/qr/generate
  - POST /api/v1/qr/scan

## Project Structure

```
prescription-ai-backend/
├── src/
│   ├── controllers/    # Request handlers
│   ├── models/        # Database models
│   ├── routes/        # API routes
│   ├── services/      # Business logic
│   ├── middleware/    # Custom middleware
│   ├── utils/         # Utility functions
│   ├── config/        # Configuration files
│   ├── types/         # TypeScript types
│   └── app.ts         # Application entry point
├── tests/             # Test files
├── uploads/           # File upload directory
└── dist/             # Compiled JavaScript
```

## Security

- JWT-based authentication
- Rate limiting
- Input validation
- Data encryption
- HIPAA compliance measures
- Audit logging

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support, email support@prescription-ai.com or create an issue in the repository. 