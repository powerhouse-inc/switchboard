import { objectType, inputObjectType } from 'nexus/dist';
import { compare, hash } from 'bcrypt';
import { PrismaClient, User as PrismaUser } from '@prisma/client';
import { GraphQLError } from 'graphql';
import builder from '../../graphql/pothos'
import {
  AUTH_SIGNUP_ENABLED,
} from '../../env';

builder.prismaObject( 'User', {
  name: 'User',
  description: 'A user of the application',
  fields: (t) => ({
    id: t.exposeID('id'),
    username: t.exposeString('username'),
    password: t.exposeString('password'),
  }),
});

class UserNamePasss {
  username: string;
  password: string;
  constructor(username: string, password: string) {
    this.username = username;
    this.password = password;
  }
}

builder.objectType(UserNamePasss, {
  name: 'UserNamePass',
  description: 'Sign up / in with username and password',
  fields: (t) => ({
    username: t.exposeString('username', {nullable: false}),
    password: t.exposeString('password', {nullable: false}),
  }),
})
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

export function getUserCrud(prisma: PrismaClient) {
  return {
    getUserByUsernamePassword: async (userNamePass: { username: string; password: string }) => {
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
      return user;
    },
    createUser: async (user: { username: string; password: string }) => {
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
          throw new GraphQLError('Username already taken', { extensions: { code: 'USERNAME_TAKEN' } });
        }
        /* istanbul ignore next @preserve */
        throw e;
      }
      return createdUser;
    },
  };
}
