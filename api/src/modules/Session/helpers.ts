import type { PrismaClient, Prisma } from '@prisma/client';
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
    throw new GraphQLError('Access denied due to origin restriction', {
      extensions: { code: 'ORIGIN_FORBIDDEN' },
    });
  }
}

async function newSession(
  prisma: PrismaClient,
  session: Prisma.SessionCreateInput,
) {
  return prisma.session.create({
    data: session,
  });
}

export const generateTokenAndSession = async (
  prisma: PrismaClient,
  userId: string,
  session: { expiryDurationSeconds?: number | null; name: string; allowedOrigins: string },
  isUserCreated: boolean = false,
) => {
  const createId = randomUUID();
  const createdToken = tokenUtils.generate(createId, session.expiryDurationSeconds);
  const expiryDate = tokenUtils.getExpiryDateFromToken(createdToken);
  const formattedToken = tokenUtils.format(createdToken);
  const parsedAllowedOrigins = parseOriginMarkup(session.allowedOrigins);
  const createData = {
    allowedOrigins: parsedAllowedOrigins,
    name: session.name,
    referenceExpiryDate: expiryDate,
    id: createId,
    referenceTokenId: formattedToken,
    isUserCreated,
    creator: {
      connect: {
        id: userId,
      },
    },
  };
  const createdSession = await newSession(prisma, createData);
  return {
    token: createdToken,
    session: createdSession,
  };
};
