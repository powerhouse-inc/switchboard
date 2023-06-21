import { objectType } from 'nexus/dist';
import { PrismaClient } from '@prisma/client';
import { GraphQLError } from 'graphql';
import {
  AUTH_SIGNUP_ENABLED,
} from '../../env';

export const User = objectType({
  name: 'User',
  definition(t) {
    t.nonNull.string('id');
  },
});

export function getUserCrud(prisma: Omit<PrismaClient, '$connect' | '$disconnect' | '$on' | '$transaction' | '$use'>) {
  return {

    async createUserIfNotExists(user: { address: string }) {
      if (!AUTH_SIGNUP_ENABLED) {
        throw new GraphQLError('Sign up is disabled');
      }
      return prisma.user.upsert({
        where: {
          address: user.address,
        },
        update: {},
        create: { ...user },
      });
    },

  };
}
