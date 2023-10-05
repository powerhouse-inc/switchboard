import { PrismaClient } from '@prisma/client';
import { extend } from './prisma/extesion';
import * as types from './src/index';

export const setup = (prisma: PrismaClient) => {
  const extended = extend(prisma);
  return { types, prisma: extended };
};
