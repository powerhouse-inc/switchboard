import builder from '../builder';
import { CoreUnit } from './model';
import prisma from '../../database';

builder.queryField('coreUnits', (t) => t.field({
  type: t.listRef(CoreUnit),
  resolve: async () => prisma.coreUnit.findMany(),
}));

builder.queryField('coreUnit', (t) => t.field({
  type: CoreUnit,
  args: {
    id: t.arg({
      type: 'String',
      required: true,
    }),
  },
  resolve: async (_parent, { id }) => {
    const unit = await prisma.coreUnit.findUnique({
      where: {
        id,
      },
    });
    if (!unit) {
      throw new Error('Unit not found');
    }
    return unit;
  },
}));
