import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from server directory
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

export const env = {
  PORT: parseInt(process.env.PORT, 10) || 5000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:5173',
  DB: {
    HOST: process.env.DB_HOST || '127.0.0.1',
    PORT: parseInt(process.env.DB_PORT, 10) || 3306,
    USER: process.env.DB_USER || 'root',
    PASSWORD: process.env.DB_PASSWORD || '',
    NAME: process.env.DB_NAME || 'stockwise_db',
    CONNECTION_LIMIT: parseInt(process.env.DB_CONNECTION_LIMIT, 10) || 10
  },
  JWT: {
    SECRET: process.env.JWT_SECRET || 'stockwise_super_secret_jwt_key_2026_enterprise_production_ready',
    EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d'
  },
  BCRYPT_ROUNDS: parseInt(process.env.BCRYPT_SALT_ROUNDS, 10) || 10
};
