import ms from 'ms';
import { sign, verify as jwtVerify } from 'jsonwebtoken';
import { GraphQLError } from 'graphql';
import z from 'zod';
import { JWT_SECRET, JWT_EXPIRATION_PERIOD } from '../env';

const jwtSchema = z.object({
  sessionId: z.string(),
  exp: z.optional(z.number()),
});

export const format = (token: string) => `${token.slice(0, 3)}...${token.slice(-3)}`;

/** Generate a JWT token
 * - If expiryDurationSeconds is null, the token will never expire
 * - If expiryDurationSeconds is undefined, the token will expire after the default expiry period
 */
export const generate = (
  sessionId: string,
  expiryDurationSeconds?: number | null,
) => {
  if (expiryDurationSeconds === null) {
    return sign({ sessionId }, JWT_SECRET);
  }
  const expiresIn = typeof expiryDurationSeconds !== 'undefined'
    ? ms(expiryDurationSeconds * 1000)
    : JWT_EXPIRATION_PERIOD;
  return sign({ sessionId }, JWT_SECRET, { expiresIn });
};

export const getExpiryDateFromToken = (token: string) => {
  const { exp } = jwtSchema.parse(jwtVerify(token, JWT_SECRET));
  if (!exp) {
    return null;
  }
  return new Date(exp * 1000);
};

export function verify(token: string) {
  const verified = jwtVerify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      throw new GraphQLError(
        err.name === 'TokenExpiredError'
          ? 'Token expired'
          : 'Invalid authentication token',
        { extensions: { code: 'AUTHENTICATION_TOKEN_ERROR' } },
      );
    }
    return decoded;
  }) as any;
  const validated = jwtSchema.parse(verified);
  return validated;
}
