import ms from 'ms';
import { sign } from 'jsonwebtoken';
import { JWT_SECRET, JWT_EXPIRATION_PERIOD } from '../env';

export const format = (token: string) => `${token.slice(0, 3)}...${token.slice(-3)}`;
export const generate = (sessionId: string, expiresInMs?: number) => sign(
  { sessionId },
  JWT_SECRET,
  { expiresIn: expiresInMs ? ms(expiresInMs) : JWT_EXPIRATION_PERIOD },
);
