import { GraphQLError } from 'graphql';
import { Context } from '../../graphql/server';

export function isAdmin(user: string) {
  const { ADMIN_USERS } = process.env;
  return ADMIN_USERS?.split(',').includes(user);
}

export async function checkUserIsAdmin(ctx: Context) {
  const { revokedAt, createdBy } = await ctx.getSession();
  console.log(createdBy, revokedAt)
  if (revokedAt || !createdBy || !isAdmin(createdBy)) {
    throw new GraphQLError('Access denied');
  }
}
