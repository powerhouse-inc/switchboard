import ms from 'ms';
import z from 'zod';
import type { Prisma } from '@prisma/client';
import { randomUUID } from 'crypto';
import { GraphQLError } from 'graphql';
import wildcard from 'wildcard-match';
import { sign, verify as jwtVerify } from 'jsonwebtoken';
import { JWT_SECRET, JWT_EXPIRATION_PERIOD } from '../../env';

const jwtSchema = z.object({
  sessionId: z.string(),
  exp: z.optional(z.number()),
});

export const formatToken = (token: string) => `${token.slice(0, 4)}...${token.slice(-4)}`;

/** Generate a JWT token
 * - If expiryDurationSeconds is null, the token will never expire
 * - If expiryDurationSeconds is undefined, the token will expire after the default expiry period
 */
const generateToken = (
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

const getExpiryDateFromToken = (token: string) => {
  const { exp } = jwtSchema.parse(jwtVerify(token, JWT_SECRET));
  if (!exp) {
    return null;
  }
  return new Date(exp * 1000);
};

export const verifyToken = (token: string) => {
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
};

function parseOriginMarkup(originParam: string): string {
  if (originParam === '*') {
    return '*';
  }
  const trimmedOriginParam = originParam.trim();
  const origins = trimmedOriginParam.split(',').map((origin) => origin.trim());
  origins.forEach((origin) => {
    if (!origin.startsWith('http://') && !origin.startsWith('https://')) {
      throw new GraphQLError("Origin must start with 'http://' or 'https://'", {
        extensions: { code: 'INVALID_ORIGIN_PROTOCOL' },
      });
    }
  });
  return origins.join(',');
}

export function validateOriginAgainstAllowed(
  allowedOrigins: string,
  originReceived?: string,
) {
  if (allowedOrigins === '*') {
    return;
  }
  if (!originReceived) {
    throw new GraphQLError('Origin not provided', {
      extensions: { code: 'ORIGIN_HEADER_MISSING' },
    });
  }
  const allowedOriginsSplit = allowedOrigins.split(',');
  if (!wildcard(allowedOriginsSplit)(originReceived)) {
    throw new GraphQLError(`Access denied due to origin restriction: ${allowedOrigins}, ${originReceived}`, {
      extensions: { code: 'ORIGIN_FORBIDDEN' },
    });
  }
}

export const generateTokenAndSession = async (
  prisma: Prisma.TransactionClient,
  userId: string,
  session: { expiryDurationSeconds?: number | null; name: string; allowedOrigins: string },
  isUserCreated: boolean = false,
) => {
  const sessionId = randomUUID();
  const generatedToken = generateToken(sessionId, session.expiryDurationSeconds);
  const referenceExpiryDate = getExpiryDateFromToken(generatedToken);
  const referenceTokenId = formatToken(generatedToken);
  const allowedOrigins = parseOriginMarkup(session.allowedOrigins);
  const createdSession = await prisma.session.create({
    data: {
      id: sessionId,
      name: session.name,
      allowedOrigins,
      referenceExpiryDate,
      referenceTokenId,
      isUserCreated,
      creator: {
        connect: {
          address: userId,
        },
      },
    },
  });
  return {
    token: generatedToken,
    session: createdSession,
  };
};
