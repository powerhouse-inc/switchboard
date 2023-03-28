import ms from 'ms';
import { sign } from 'jsonwebtoken';
import { JWT_SECRET, JWT_EXPIRATION_PERIOD } from '../env';

export const format = (token: string) => `${token.slice(0, 3)}...${token.slice(-3)}`;

export const generate = (sessionId: string, expireDate?: Date) => {
  const expiresIn = expireDate
    ? ms(expireDate.getTime() - Date.now())
    : JWT_EXPIRATION_PERIOD;
  return sign({ sessionId }, JWT_SECRET, { expiresIn });
};
