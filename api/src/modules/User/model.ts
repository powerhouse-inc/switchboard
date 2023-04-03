import builder from '../builder'
import { Session } from '../Session/model';

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

