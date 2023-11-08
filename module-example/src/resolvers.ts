import { PrismaClient } from '@prisma/client';
import { queryField, nonNull, objectType } from 'nexus/dist';

interface Context {
  prisma: PrismaClient;
}

// New graphql types can be defined here
export const Counter = objectType({
  name: 'Counter',
  definition(t) {
    t.nonNull.string('message');
    t.nonNull.int('count');
  },
});

// New graphql resolvers can be defined here
export const countUsers = queryField('countUsers', {
  type: 'Counter',
  args: {
    message: nonNull('String'),
  },
  resolve: async (_root, args, ctx: Context) => {
    // Note that prisma client received here is fully extended
    // (both with core modules, but also with extension defined in the `model.ts`)
    const count = await ctx.prisma.user.getCount();
    return {
      message: args.message, // example of a required argument
      count, // example of local prisma extention
    };
  },
});
