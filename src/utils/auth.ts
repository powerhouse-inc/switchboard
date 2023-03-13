import { verify } from 'jsonwebtoken';
import { JWT_SECRET } from '../env';

const SECRET = JWT_SECRET;

export function getUserId(authorization: string): string | null {
  if (!authorization) {
    return null;
  }
  const token = authorization.replace('Bearer ', '');
  const verifiedToken = verify(token, SECRET) as { userId: string };
  return verifiedToken && verifiedToken.userId;
}

export const APP_SECRET = JWT_SECRET;
