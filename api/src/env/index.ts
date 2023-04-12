import dotenv from 'dotenv';
import { getJwtSecret, getJwtExpirationPeriod } from './getters';

dotenv.config();

export const JWT_SECRET = getJwtSecret();
export const PORT = Number(process.env.PORT ?? '3000');
export const isDevelopment = process.env.NODE_ENV === 'development';
export const JWT_EXPIRATION_PERIOD: string = getJwtExpirationPeriod();
