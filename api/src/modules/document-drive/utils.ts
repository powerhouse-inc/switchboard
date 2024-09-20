import { ActionContext } from 'document-model/document';
import { GraphQLError } from 'graphql';
import { Context } from '../../graphql/server/index/context';

const isDevelopment = process.env.NODE_ENV === 'development';

export function isAdmin(user: string) {
  const { ADMIN_USERS } = process.env;
  return ADMIN_USERS?.split(',')
    .map(e => e.toLocaleLowerCase())
    .includes(user.toLocaleLowerCase());
}

export async function checkUserIsAdmin(ctx: Context) {
  if (isDevelopment) {
    return;
  }
  const { revokedAt, createdBy, referenceExpiryDate } = await ctx.getSession();
  if (
    process.env.ADMIN_USERS !== undefined &&
    ((referenceExpiryDate && referenceExpiryDate < new Date()) ||
      revokedAt ||
      !createdBy ||
      !isAdmin(createdBy))
  ) {
    throw new GraphQLError('Access denied');
  }
}

export function migrateOperationContext(context?: ActionContext) {
  if (!context || !context.signer || context.signer?.signatures) {
    return context;
  }
  return {
    ...context,
    signer: {
      ...context.signer,
      signatures: []
    }
  };
}
