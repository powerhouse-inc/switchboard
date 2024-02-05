import { Prisma } from '@prisma/client';
import { GraphQLError } from 'graphql';
import {
  AUTH_SIGNUP_ENABLED,
} from '../../../env';
import { getChildLogger } from '../../../logger';

const logger = getChildLogger({ msgPrefix: 'User' });

export function getUserCrud(prisma: Prisma.TransactionClient) {
  return {

    async createUserIfNotExists(user: { address: string }) {
      if (!AUTH_SIGNUP_ENABLED) {
        logger.error('User tried to sign in, while sign up is disabled', user.address, AUTH_SIGNUP_ENABLED);
        throw new GraphQLError('Sign up is disabled');
      }
      const upsertedUser = await prisma.user.upsert({
        where: {
          address: user.address,
        },
        update: {},
        create: { ...user },
      });
      logger.error('Upserted user', upsertedUser);
      return upsertedUser;
    },

  };
}
