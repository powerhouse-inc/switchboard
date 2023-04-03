import builder from '../builder'

export const Session = builder.prismaObject('Session', {
  fields: (t) => ({
    id: t.exposeID('id'),
    createdAt: t.expose('createdAt', { type: 'DateTime' }),
    createdBy: t.exposeString('createdBy'),
    referenceExpiryDate: t.expose('referenceExpiryDate', { type: 'DateTime', nullable: true }),
    referenceTokenId: t.exposeString('referenceTokenId'),
    isUserCreated: t.exposeBoolean('isUserCreated'),
    name: t.exposeString('name', { nullable: true }),
    revokedAt: t.expose('revokedAt', { type: 'DateTime', nullable: true }),
  }),
});

export const SessionCreate = builder.inputType('SessionCreateInput', {
  fields: (t) => ({
    expiryDurationSeconds: t.int({ required: false }),
    name: t.string({ required: true }),
  }),
});

export const SessionCreateOutput = builder.simpleObject('SessionCreateOutput', {
  fields: (t) => ({
    token: t.string({ nullable: false }),
    session: t.field({ type: Session, nullable: false }),
  }),
});


