import { PrismaClient } from '@prisma/client';
import { objectType, inputObjectType } from 'nexus/dist';
import { sign } from 'jsonwebtoken';
import { compare, hash } from 'bcrypt';
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

export class UserInterface {
  constructor(private readonly UserPrisma: PrismaClient['user']) {}

  async signIn(userNamePass: { username: string; password: string }) {
    const { username, password } = userNamePass;
    const user = await this.UserPrisma.findUnique({
      where: {
        username,
      },
    });
    if (!user) {
      throw new Error('user not found');
    }
    const passwordValid = (await compare(password, user.password || '')) || false;
    if (!passwordValid) {
      throw new Error('invalid password');
    }
    return {
      token: sign({ userId: user.id }, JWT_SECRET, { expiresIn: JWT_EXPIRATION_PERIOD }),
      user,
    };
  }

  async signUp(user: { username: string; password: string }) {
    if (!AUTH_SIGNUP_ENABLED) {
      throw new Error('Sign up is disabled');
    }
    const { username, password } = user;
    const hashedPassword = await hash(password, 10);
    const created = await this.UserPrisma.create({
      data: {
        username,
        password: hashedPassword,
      },
    });
    return {
      token: sign({ userId: created.id }, JWT_SECRET),
      user: created,
    };
  }
}
