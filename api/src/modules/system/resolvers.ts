import {
  extendType,
  interfaceType,
  list, mutationField, nonNull, objectType, queryField, stringArg,
} from 'nexus';
import logger from '../../logger';



export const authType = objectType({
  name: 'Auth',
  definition(t) {
    t.field('me', {
      type: 'User',
      resolve: async (_, __, ctx) => {
        const { createdBy } = await ctx.getSession();
        return ctx.prisma.user.findUnique({
          where: {
            address: createdBy,
          },
        });
      },
    });
    t.field('sessions', {
      resolve: async (_, __, ctx) => {
        const { createdBy } = await ctx.getSession();
        return ctx.prisma.session.listSessions(createdBy);
      },
      type: list('Session'),
    });
  },
});

export const systemType = interfaceType({
  name: 'System',
  definition(t) {
    t.field('auth', {
      type: authType,
      resolve: async () => true,
    });
  },
  resolveType: () => true,
});

export const system = objectType({
  name: 'ServerSystem',
  definition(t) {
    t.implements(systemType);
  },
});

export const systemQueryField = queryField('system', {
  type: system,
  resolve: async () => true,
});
