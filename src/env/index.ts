import dotenv from 'dotenv';
import { getJwtSecret } from './getters'

dotenv.config();

export const JWT_SECRET = getJwtSecret();
export const PORT = Number(process.env.PORT ?? '3000');
export const isDevelopment = process.env.NODE_ENV === 'development';
export const AUTH_SIGNUP_ENABLED = Boolean(process.env.AUTH_SIGNUP_ENABLED);
export const JWT_EXPIRATION_PERIOD = process.env.JWT_EXPIRATION_PERIOD_SECONDS ? Number(process.env.JWT_EXPIRATION_PERIOD_SECONDS) : '7d';
