import type { PrismaClient } from '@prisma/client';
import { randomUUID } from 'crypto';
import { GraphQLError } from 'graphql';
import wildcard from 'wildcard-match';
import { token as tokenUtils } from '../../helpers';

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
  prisma: Omit<PrismaClient, '$connect' | '$disconnect' | '$on' | '$transaction' | '$use'>,
  userId: string,
  session: { expiryDurationSeconds?: number | null; name: string; allowedOrigins: string },
  isUserCreated: boolean = false,
) => {
  const sessionId = randomUUID();
  const generatedToken = tokenUtils.generate(sessionId, session.expiryDurationSeconds);
  const referenceExpiryDate = tokenUtils.getExpiryDateFromToken(generatedToken);
  const referenceTokenId = tokenUtils.format(generatedToken);
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
