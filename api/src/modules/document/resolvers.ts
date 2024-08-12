import { interfaceType, list, nonNull, objectType, queryField } from 'nexus';
import { Context } from '../../graphql/server/drive/context';
import { getChildLogger } from '../../logger';
import { GQLDateBase } from '../system';

const logger = getChildLogger({ msgPrefix: 'DOCUMENT RESOLVER' });

// todo: resolveType should be moved to somewhere else
export const operationModelInterface = interfaceType({
  name: 'IOperation',
  definition(t) {
    t.nonNull.string('type');
    t.nonNull.int('index');
    t.nonNull.field('timestamp', { type: GQLDateBase });
    t.nonNull.string('hash');
    t.string('id');
  },
  resolveType: e => {
    return 'DefaultOperation';
  }
});

export const operationModel = objectType({
  name: 'DefaultOperation',
  definition(t) {
    t.implements(operationModelInterface);
  }
});

// todo: resolveType should be moved to somewhere else
export const documentModelInterface = interfaceType({
  name: 'IDocument',
  definition(t) {
    t.nonNull.string('id');
    t.nonNull.string('name');
    t.nonNull.string('documentType');
    t.nonNull.int('revision');
    t.nonNull.field('created', { type: GQLDateBase });
    t.nonNull.field('lastModified', { type: GQLDateBase });
    t.nonNull.list.nonNull.field('operations', { type: operationModel });
  },
  resolveType: e => {
    switch (e.documentType) {
      case 'powerhouse/budget-statement':
        return 'BudgetStatement';
      case 'powerhouse/account-snapshot':
        return 'AccountSnapshot';
      case 'makerdao/rwa-portfolio':
        return 'RealWorldAssets';
      default:
        return 'DefaultDocument';
    }
  }
});

export const defaultDocument = objectType({
  name: 'DefaultDocument',
  definition(t) {
    t.implements(documentModelInterface);
  }
});

export const documentQuery = queryField('document', {
  type: documentModelInterface,
  args: {
    id: nonNull('String')
  },
  resolve: async (_root, { id }, ctx: Context) => {
    if (!ctx.driveId) {
      throw new Error('DriveId is not defined');
    }
    const doc = await ctx.prisma.document.getDocument(ctx.driveId, id);
    return doc;
  }
});

export const documentsQuery = queryField('documents', {
  type: list(documentModelInterface),
  resolve: async (_root, { id }, ctx: Context) => {
    if (!ctx.driveId) {
      throw new Error('DriveId is not defined');
    }
    try {
      const docIds = await ctx.prisma.document.getDocuments(ctx.driveId);
      const docs = await Promise.all(
        docIds.map(doc => {
          return ctx.prisma.document.getDocument(ctx.driveId!, doc);
        })
      );
      return docs;
    } catch (e: any) {
      logger.error({ msg: e.message });
    }
  }
});
