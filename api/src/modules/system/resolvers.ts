import {
  extendType,
  interfaceType,
  list, mutationField, nonNull, objectType, queryField, scalarType, stringArg,
} from 'nexus';
import logger from '../../logger';
import { Context } from '../../graphql/server/index/context';



export const authType = objectType({
  name: 'Auth',
  definition(t) {
    t.field('me', {
      type: 'User',
      resolve: async (_, __, ctx: Context) => {
        const { createdBy } = await ctx.getSession();
        return ctx.prisma.user.findUnique({
          where: {
            address: createdBy,
          },
        });
      },
    });
    t.field('sessions', {
      resolve: async (_, __, ctx: Context) => {
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
  name: 'SwitchboardHost',
  definition(t) {
    t.implements(systemType);
  },
});

export const systemQueryField = queryField('system', {
  type: system,
  resolve: async () => true,
});

export const GQLDateBase = scalarType({
  name: 'Date',
  asNexusMethod: 'date',
  description: 'Date custom scalar type',
  serialize(value: any) {
    if (value instanceof Date) {
      return value.toISOString();
    }

    return value;
  },
  parseValue(value: unknown) {
    if (typeof value === 'string') {
      return new Date(value);
    }
    return null;
  },
});


export const GQLAttachmentBase = scalarType({
  name: 'Attachment',
  asNexusMethod: 'attachment',
  description: 'Attachment custom scalar type',
  serialize(value: any) {
    return JSON.stringify(value);
  },
  parseValue(value: unknown) {
    return JSON.parse(value as string);
  },
});
