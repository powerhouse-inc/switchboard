import { objectType } from 'nexus/dist';
import { PrismaClient, User as PrismaUser } from '@prisma/client';
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

export const AuthPayload = objectType({
  name: 'AuthPayload',
  definition(t) {
    t.nonNull.string('token');
    t.nonNull.field('session', { type: 'Session' });
  },
});

export function getUserCrud(prisma: PrismaClient) {
  return {
    createUser: async (user: { address: string }) => {
      if (!AUTH_SIGNUP_ENABLED) {
        throw new Error('Sign up is disabled');
      }
      let createdUser: PrismaUser;
      try {
        createdUser = await prisma.user.create({
          data: {
            address: user.address,
          },
        });
      } catch (e: any) {
        if ('code' in e && e.code === 'P2002') {
          throw new GraphQLError('Username already taken', { extensions: { code: 'USERNAME_TAKEN' } });
        }
        /* istanbul ignore next @preserve */
        throw e;
      }
      return createdUser;
    },
  };
}
