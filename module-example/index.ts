import * as types from './src/index';
import { PrismaClient } from '@prisma/client';

const getUserCrud = (prisma: PrismaClient) => ({
  doCount: async () => {
    const aggr = await prisma.user.aggregate({_count: {address: true}})
    const message = 'Hello from Prisma';
    return {
      count: aggr['_count'].address,
      message
    }
  }
})

export const setup = (prisma: PrismaClient) => {
  console.log('Setting up Prisma')
  const extended = prisma.$extends({
    model: {
      user: getUserCrud(prisma),
    },
  })
  console.log('Prisma setup complete')
  return {types, prisma: extended}
};


