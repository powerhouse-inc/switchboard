import { objectType, inputObjectType } from 'nexus/dist';
import { sign } from 'jsonwebtoken';
import { compare, hash } from 'bcrypt';
import { PrismaClient, User as PrismaUser } from '@prisma/client';
import { GraphQLError } from 'graphql';
import {
  AUTH_SIGNUP_ENABLED,
  JWT_EXPIRATION_PERIOD,
  JWT_SECRET,
} from '../../env';

export const User = objectType({
  name: 'User',
  definition(t) {
    t.string('id');
    t.string('username');
    t.string('password');
  },
});

export const UserNamePass = inputObjectType({
  name: 'UserNamePass',
  definition(t) {
    t.nonNull.string('username');
    t.nonNull.string('password');
  },
});

export const AuthPayload = objectType({
  name: 'AuthPayload',
  definition(t) {
    t.string('token');
    t.field('user', { type: 'User' });
  },
});

export function getUserCrud(prisma: PrismaClient) {
  return {
    signIn: async (userNamePass: { username: string; password: string }) => {
      const { username, password } = userNamePass;
      const user = await prisma.user.findUnique({
        where: {
          username,
        },
      });
      if (!user) {
        throw new GraphQLError('User not found', { extensions: { code: 'USER_NOT_FOUND' } });
      }
      const passwordValid = await compare(password, user.password);
      if (!passwordValid) {
        throw new GraphQLError('Invalid password', { extensions: { code: 'INVALID_PASSWORD' } });
      }
      return {
        token: sign({ userId: user.id }, JWT_SECRET, {
          expiresIn: JWT_EXPIRATION_PERIOD,
        }),
        user,
      };
    },
    signUp: async (user: { username: string; password: string }) => {
      if (!AUTH_SIGNUP_ENABLED) {
        throw new Error('Sign up is disabled');
      }
      const { username, password } = user;
      const hashedPassword = await hash(password, 10);
      let created: PrismaUser;
      try {
        created = await prisma.user.create({
          data: {
            username,
            password: hashedPassword,
          },
        });
      } catch (e: any) {
        if ('code' in e && e.code === 'P2002') {
          throw new GraphQLError('Username already taken', { extensions: { code: 'USERNAME_TAKEN' } });
        }
        /* istanbul ignore next @preserve */
        throw e;
      }
      return {
        token: sign({ userId: created.id }, JWT_SECRET),
        user: created,
      };
    },
  };
}
