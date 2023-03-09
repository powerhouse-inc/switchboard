import { verify } from 'jsonwebtoken';

const {
  JWT_SECRET = 'undefined',
} = process.env;
export function getUserId(authorization: string): string | null {
  if (!authorization) {
    return null;
  }

  const token = authorization.replace('Bearer ', '');
  const verifiedToken = verify(token, JWT_SECRET) as { userId: string };

  return verifiedToken && verifiedToken.userId;
}

export const APP_SECRET = JWT_SECRET;
