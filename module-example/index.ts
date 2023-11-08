import { PrismaClient } from '@prisma/client';
import { prismaExtension } from './src/model';
import * as resolvers from './src/resolvers';

const setup = (prisma: PrismaClient) => {
  // Received prisma client is extended with new methods defined in this module
  // To later be received inside `ctx` of each resolver
  const extendedPrisma = prisma.$extends(prismaExtension);
  return { resolvers, extendedPrisma };
};

export default setup;
