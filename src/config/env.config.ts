import dotenv from "dotenv";
import path from "path";

// Load environment variables
dotenv.config();

export const envConfig = {
  // Server Configuration
  server: {
    port: process.env.PORT || 3000,
    nodeEnv: process.env.NODE_ENV || "development",
  },

  // MongoDB Configuration
  mongodb: {
    uri: process.env.MONGODB_URI || "mongodb://localhost:27017/prescription-ai",
    user: process.env.MONGODB_USER || "",
    password: process.env.MONGODB_PASSWORD || "",
  },

  // JWT Configuration
  jwt: {
    secret:
      process.env.JWT_SECRET ||
      "your-super-secret-jwt-key-change-in-production",
    expiresIn: parseInt(process.env.JWT_EXPIRES_IN || "604800"), // 7 days in seconds
    refreshSecret:
      process.env.JWT_REFRESH_SECRET ||
      "your-super-secret-refresh-key-change-in-production",
    refreshExpiresIn: parseInt(process.env.JWT_REFRESH_EXPIRES_IN || "2592000"), // 30 days in seconds
  },

  // File Upload Configuration
  upload: {
    dir: process.env.UPLOAD_DIR || "uploads",
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE || "5242880"), // 5MB in bytes
    allowedFileTypes: (
      process.env.ALLOWED_FILE_TYPES || "image/jpeg,image/png,image/jpg"
    ).split(","),
  },

  // SMS Service Configuration
  sms: {
    provider: process.env.SMS_PROVIDER || "twilio",
    accountSid: process.env.SMS_ACCOUNT_SID || "",
    authToken: process.env.SMS_AUTH_TOKEN || "",
    fromNumber: process.env.SMS_FROM_NUMBER || "",
  },

  // Logging Configuration
  logging: {
    level: process.env.LOG_LEVEL || "debug",
    filePath:
      process.env.LOG_FILE_PATH || path.join(process.cwd(), "logs", "app.log"),
  },

  // Rate Limiting
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || "900000"), // 15 minutes
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || "100"),
  },

  // CORS Configuration
  cors: {
    origin: process.env.CORS_ORIGIN || "http://localhost:3000",
  },

  // API Documentation
  apiDocs: {
    path: process.env.API_DOCS_PATH || "/api-docs",
  },

  // QR Code Configuration
  qrCode: {
    expiry: parseInt(process.env.QR_CODE_EXPIRY || "86400"), // 24 hours
    size: parseInt(process.env.QR_CODE_SIZE || "300"),
  },

  // OCR Service Configuration
  ocr: {
    provider: process.env.OCR_PROVIDER || "tesseract",
    language: process.env.OCR_LANGUAGE || "eng",
    configPath: process.env.OCR_CONFIG_PATH || "config/tesseract-config.json",
  },

  // Redis Configuration
  redis: {
    host: process.env.REDIS_HOST || "localhost",
    port: parseInt(process.env.REDIS_PORT || "6379"),
    password: process.env.REDIS_PASSWORD || "",
    db: parseInt(process.env.REDIS_DB || "0"),
  },

  // Email Service Configuration
  email: {
    provider: process.env.EMAIL_PROVIDER || "smtp",
    host: process.env.EMAIL_HOST || "smtp.gmail.com",
    port: parseInt(process.env.EMAIL_PORT || "587"),
    user: process.env.EMAIL_USER || "",
    password: process.env.EMAIL_PASSWORD || "",
    from: process.env.EMAIL_FROM || "",
  },

  // Security
  security: {
    bcryptSaltRounds: parseInt(process.env.BCRYPT_SALT_ROUNDS || "10"),
    sessionSecret: process.env.SESSION_SECRET || "your-session-secret-key",
    cookieSecret: process.env.COOKIE_SECRET || "your-cookie-secret-key",
  },

  // Monitoring and Analytics
  monitoring: {
    enabled: process.env.ENABLE_MONITORING === "true",
    service: process.env.MONITORING_SERVICE || "prometheus",
    metricsPort: parseInt(process.env.METRICS_PORT || "9090"),
  },

  // Feature Flags
  features: {
    qrCode: process.env.ENABLE_QR_CODE === "true",
    ocr: process.env.ENABLE_OCR === "true",
    fileUpload: process.env.ENABLE_FILE_UPLOAD === "true",
    emailNotifications: process.env.ENABLE_EMAIL_NOTIFICATIONS === "true",
    smsNotifications: process.env.ENABLE_SMS_NOTIFICATIONS === "true",
  },

  // Cache Configuration
  cache: {
    ttl: parseInt(process.env.CACHE_TTL || "3600"), // 1 hour
    prefix: process.env.CACHE_PREFIX || "prescription-ai",
  },

  // Error Reporting
  errorReporting: {
    service: process.env.ERROR_REPORTING_SERVICE || "sentry",
    sentryDsn: process.env.SENTRY_DSN || "",
  },

  // Backup Configuration
  backup: {
    enabled: process.env.BACKUP_ENABLED === "true",
    frequency: process.env.BACKUP_FREQUENCY || "daily",
    retentionDays: parseInt(process.env.BACKUP_RETENTION_DAYS || "30"),
    path: process.env.BACKUP_PATH || "backups",
  },

  // Health Check
  healthCheck: {
    interval: parseInt(process.env.HEALTH_CHECK_INTERVAL || "300000"), // 5 minutes
    timeout: parseInt(process.env.HEALTH_CHECK_TIMEOUT || "5000"), // 5 seconds
  },
};
