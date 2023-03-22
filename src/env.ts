import dotenv from 'dotenv';

dotenv.config();

export const getJwtSecret = (): string => {
  if (!process.env.JWT_SECRET) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('JWT_SECRET is not defined');
    }
  }
  return process.env.JWT_SECRET || 'dev';
};

export const JWT_SECRET = getJwtSecret();
export const PORT = Number(process.env.PORT ?? '3000');
export const isDevelopment = process.env.NODE_ENV === 'development';
export const AUTH_SIGNUP_ENABLED = Boolean(process.env.AUTH_SIGNUP_ENABLED);
export const JWT_EXPIRATION_PERIOD = process.env.JWT_EXPIRATION_PERIOD_SECONDS ? Number(process.env.JWT_EXPIRATION_PERIOD_SECONDS) : '7d';
