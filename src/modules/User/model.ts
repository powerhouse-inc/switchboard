import { objectType, inputObjectType } from 'nexus/dist';
import { compare, hash } from 'bcrypt';
import { PrismaClient, User as PrismaUser } from '@prisma/client';
import { ApolloError } from 'apollo-server-core';
import ms from 'ms';
import { AUTH_SIGNUP_ENABLED, JWT_EXPIRATION_PERIOD } from '../../env';
import { generateTokenAndSession } from '../Session';

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
    t.field('session', { type: 'Session' });
  },
});

const getReferenceExpiryDate = () => new Date(Date.now() + ms(JWT_EXPIRATION_PERIOD));

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
        throw new ApolloError('User not found', 'USER_NOT_FOUND');
      }
      const passwordValid = await compare(password, user.password);
      if (!passwordValid) {
        throw new ApolloError('Invalid password', 'INVALID_PASSWORD');
      }
      const { session, token } = await generateTokenAndSession(
        prisma,
        user.id,
        {
          referenceExpiryDate: getReferenceExpiryDate(),
        },
      );
      return {
        token,
        session,
      };
    },
    signUp: async (user: { username: string; password: string }) => {
      if (!AUTH_SIGNUP_ENABLED) {
        throw new Error('Sign up is disabled');
      }
      const { username, password } = user;
      const hashedPassword = await hash(password, 10);
      let createdUser: PrismaUser;
      try {
        createdUser = await prisma.user.create({
          data: {
            username,
            password: hashedPassword,
          },
        });
      } catch (e: any) {
        if ('code' in e && e.code === 'P2002') {
          throw new ApolloError('Username already taken', 'USERNAME_TAKEN');
        }
        /* istanbul ignore next @preserve */
        throw e;
      }
      const { session, token } = await generateTokenAndSession(
        prisma,
        createdUser.id,
        {
          referenceExpiryDate: getReferenceExpiryDate(),
        },
      );
      return {
        token,
        session,
      };
    },
  };
}
