import  builder  from '../builder';
import { User, AuthPayload, UserNamePass } from './model'
import prisma from '../../database'

builder.queryField('me', (t) => t.field({
    type: User,
    resolve: async (_parent, _args, ctx) => {
      const session = await ctx.getSession()
      return session.creator;
    }
  })
)

builder.mutationField('signIn', (t) => t.field({
  type: AuthPayload,
  args: {
    user: t.arg({
      type: UserNamePass,
      required: true,
    })
  },
  resolve: async (_parent, {user}, _ctx) => {
    const { id } = await prisma.user.getUserByUsernamePassword(user);
    return prisma.session.createSignInSession(id);
  },
}))

builder.mutationField('signUp', (t) => t.field({
  type: AuthPayload,
  args: {
    user: t.arg({
      type: UserNamePass,
      required: true,
    })
  },
  resolve: async (_parent, {user}, _ctx) => {
    const { id } = await prisma.user.createUser(user);
    return prisma.session.createSignInSession(id);
  },
}))
