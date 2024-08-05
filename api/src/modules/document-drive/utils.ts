import { GraphQLError } from 'graphql';
import { Context } from '../../graphql/server';

export function isAdmin(user: string) {
  const { ADMIN_USERS } = process.env;
  return ADMIN_USERS?.split(',').map(e => e.toLocaleLowerCase()).includes(user.toLocaleLowerCase());
}

export async function checkUserIsAdmin(ctx: Context) {
  const { revokedAt, createdBy, referenceExpiryDate } = await ctx.getSession();
  if ((referenceExpiryDate && referenceExpiryDate < new Date()) || revokedAt || !createdBy || !isAdmin(createdBy)) {
    throw new GraphQLError('Access denied');
  }
}
