import dotenv from 'dotenv';
import { getJwtSecret, getJwtExpirationPeriod } from './getters';

dotenv.config();

export const JWT_SECRET = getJwtSecret();
export const PORT = Number(process.env.PORT ?? '3001');
export const isDevelopment = process.env.NODE_ENV === 'development';
export const AUTH_SIGNUP_ENABLED = Boolean(process.env.AUTH_SIGNUP_ENABLED);
export const JWT_EXPIRATION_PERIOD: string = getJwtExpirationPeriod();
export const API_ORIGIN = process.env.API_ORIGIN || `http://0.0.0.0:${PORT}`;
export const API_GQL_ENDPOINT = process.env.API_GQL_ENDPOINT || `${API_ORIGIN}/graphql`;
