import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import dotenv from 'dotenv';
import { sanitizeMongoUri, redactMongoUri } from '../utils/mongoUri.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Explicitly discover and load .env from server directory first, then fallback to current working directory
let loadedEnvPath = null;
const candidateEnvPaths = [
  path.resolve(__dirname, '../../.env'),         // server/.env relative to this file
  path.resolve(process.cwd(), 'server/.env'),    // When running from root workspace
  path.resolve(process.cwd(), '.env')            // Fallback root .env
];

for (const envPath of candidateEnvPaths) {
  if (fs.existsSync(envPath)) {
    const result = dotenv.config({ path: envPath });
    if (!result.error) {
      loadedEnvPath = envPath;
      break;
    }
  }
}

if (!loadedEnvPath) {
  dotenv.config(); // Standard fallback
}

const nodeEnv = process.env.NODE_ENV || 'development';
const isProduction = nodeEnv === 'production';
const isTest = nodeEnv === 'test';
const isDevelopment = nodeEnv === 'development';

// Read raw URI from environment variables
const rawMongoUri = process.env.MONGODB_URI || process.env.MONGO_URI || '';
const sanitizedMongoUri = rawMongoUri ? sanitizeMongoUri(rawMongoUri) : '';

export const env = {
  NODE_ENV: nodeEnv,
  isProduction,
  isDevelopment,
  isTest,
  PORT: parseInt(process.env.PORT || '5000', 10),
  CORS_ORIGIN: process.env.CORS_ORIGIN || process.env.CLIENT_URL || 'http://localhost:3000,http://localhost:5173,http://127.0.0.1:5173,http://localhost:4173',
  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:3000',

  // Database URIs
  MONGODB_URI: sanitizedMongoUri,
  MONGO_URI: sanitizedMongoUri,
  LOADED_ENV_PATH: loadedEnvPath,

  // Explicit opt-in flags for in-memory DB (Development/Test only, NEVER allowed in production)
  ALLOW_IN_MEMORY_DB: process.env.ALLOW_IN_MEMORY_DB === 'true',
  USE_IN_MEMORY_DB: process.env.USE_IN_MEMORY_DB === 'true',

  // JWT
  JWT_SECRET: process.env.JWT_SECRET || (isProduction ? '' : 'dwarix_dev_jwt_secret_key_2026'),
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  COOKIE_NAME: 'dwarix_admin_token',

  // Nodemailer SMTP
  SMTP_ENABLED: process.env.SMTP_ENABLED === 'true',
  SMTP_HOST: process.env.SMTP_HOST || '',
  SMTP_PORT: parseInt(process.env.SMTP_PORT || '587', 10),
  SMTP_USER: process.env.SMTP_USER || '',
  SMTP_PASS: process.env.SMTP_PASS || '',
  EMAIL_FROM: process.env.EMAIL_FROM || process.env.SMTP_FROM || 'DWARIX Technologies <dwarixtech@gmail.com>',
  ADMIN_NOTIFY_EMAIL: process.env.ADMIN_NOTIFY_EMAIL || process.env.ADMIN_NOTIFICATION_EMAIL || 'dwarixtech@gmail.com',

  // Cloudinary
  CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME || '',
  CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY || '',
  CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET || '',

  // Initial Admin Setup (Provided explicitly via environment or setup script)
  INITIAL_ADMIN_EMAIL: process.env.INITIAL_ADMIN_EMAIL || process.env.DEFAULT_ADMIN_EMAIL || '',
  INITIAL_ADMIN_PASSWORD: process.env.INITIAL_ADMIN_PASSWORD || process.env.DEFAULT_ADMIN_PASSWORD || '',
  INITIAL_ADMIN_NAME: process.env.INITIAL_ADMIN_NAME || process.env.DEFAULT_ADMIN_NAME || 'DWARIX Administrator'
};

// Aliases
export const ENV = env;
export default env;
