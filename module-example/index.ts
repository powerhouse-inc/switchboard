import { PrismaClient } from '@prisma/client';
import { prismaExtension } from './prisma/extesion';
import * as types from './src/index';

export const setup = (prisma: PrismaClient) => {
  const extended = prisma.$extends(prismaExtension);
  return { types, prisma: extended };
};
