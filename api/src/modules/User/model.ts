import { compare, hash } from 'bcrypt';
import { PrismaClient, User as PrismaUser } from '@prisma/client';
import { GraphQLError } from 'graphql';
import builder from '../builder'
import {
  AUTH_SIGNUP_ENABLED,
} from '../../env';
import prisma from '../../database';
import { Session } from '../Session/model';

builder.queryType({
  fields: (t) => ({
    me: t.prismaField({
      type: 'User',
      nullable: true,
      resolve: async (_parent, _args, _trash, ctx) => {
        const session = await ctx.getSession();
        return prisma.user.findUnique({
          where: {
            id: session.creator.id,
          }
        })
      },
    }),
  }),
})

export const UserNamePass = builder.inputType('UserNamePassInput', {
  fields: (t) => ({
    username: t.string({ required: true }),
    password: t.string({ required: true }),
  }),
})

export const User = builder.prismaObject('User', {
  name: 'User',
  description: 'A user',
  fields: (t) => ({
    id: t.exposeID('id'),
    username: t.exposeString('username'),
    password: t.exposeString('password'),
  }),
});

export const AuthPayload = builder.simpleObject('AuthPayload', {
  fields: (t) => ({
    token: t.string({nullable: false}),
    session: t.field({
      type: Session,
      nullable: false,
    }),
  }),
})

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
