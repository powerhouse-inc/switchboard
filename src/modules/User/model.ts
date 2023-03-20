import { objectType, inputObjectType } from 'nexus/dist';
import { sign } from 'jsonwebtoken';
import { compare, hash } from 'bcrypt';
import { PrismaClient, User as PrismaUser } from '@prisma/client';
import { ApolloError } from 'apollo-server-core';
import { AUTH_SIGNUP_ENABLED, JWT_EXPIRATION_PERIOD, JWT_SECRET } from '../../env';

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

function userSignUpFactory(prisma: PrismaClient) {
  return async (user: { username: string; password: string }) => {
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
        throw new ApolloError('Username already taken', 'USERNAME_TAKEN');
      }
      throw new ApolloError('Failed to create user', 'USER_CREATE_FAILED');
    }
    return {
      token: sign({ userId: created.id }, JWT_SECRET),
      user: created,
    };
  };
}

function userSignInFactory(prisma: PrismaClient) {
  return async (userNamePass: { username: string; password: string }) => {
    const { username, password } = userNamePass;
    const user = await prisma.user.findUnique({
      where: {
        username,
      },
    });
    if (!user) {
      throw new ApolloError('User not found', 'USER_NOT_FOUND');
    }
    const passwordValid = (await compare(password, user.password || '')) || false;
    if (!passwordValid) {
      throw new ApolloError('Invalid password', 'INVALID_PASSWORD');
    }
    return {
      token: sign({ userId: user.id }, JWT_SECRET, { expiresIn: JWT_EXPIRATION_PERIOD }),
      user,
    };
  };
}

export const userCrud = {
  signUp: userSignUpFactory,
  signIn: userSignInFactory,
};
