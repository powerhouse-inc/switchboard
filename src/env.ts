import dotenv from 'dotenv';

dotenv.config();

if (!process.env.JWT_SECRET) {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('JWT_SECRET is not defined');
  }
}
export const JWT_SECRET = process.env.JWT_SECRET || 'dev';
export const PORT = Number(process.env.PORT ?? '3000');
export const isDevelopment = process.env.NODE_ENV === 'development';

export const logLevel = process.env.LOG_LEVEL ?? 'info';
export const httpLogLevel = process.env.HTTP_LOG_LEVEL ?? 'warn';
export const AUTH_SIGNUP_ENABLED = Boolean(process.env.AUTH_SIGNUP_ENABLED);
export const JWT_EXPIRATION_PERIOD = process.env.JWT_EXPIRATION_PERIOD_SECONDS ? Number(process.env.JWT_EXPIRATION_PERIOD_SECONDS) : '7d';
