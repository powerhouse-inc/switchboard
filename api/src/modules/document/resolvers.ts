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
    t.nonNull.int('skip');
    t.nonNull.field('timestamp', { type: GQLDateBase });
    t.nonNull.string('hash');
    t.string('id');
    t.nonNull.string('inputText');
    t.string('error');
  },
  resolveType: () => null,
});

export const operationModel = objectType({
  name: 'DefaultOperation',
  definition(t) {
    t.implements(operationModelInterface);
  },
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
    t.nonNull.list.nonNull.field('operations', {
      args: { first: 'Int', skip: 'Int' },
      type: operationModel, resolve: async (parent, { first, skip }, ctx: Context) => {
        const operations = ctx.documents![parent.id]?.operations;
        if (operations) {
          if (first && skip) {
            return operations.slice(skip, skip + first);
          }

          if (first) {
            return operations.slice(0, first);
          }


          return operations
        }

        if (!ctx.driveId) {
          throw new Error('DriveId is not defined');
        }

        const doc = await ctx.prisma.document.getDocument(ctx.driveId, parent.id);
        return doc.operations ?? [];
      }
    },
    );
  },
  resolveType: e => {
    switch (e.documentType) {
      case 'powerhouse/document-drive':
        return 'DocumentDrive';
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
    ctx.documents![doc.id] = doc;
    return doc;
  }
});

export const documentsQuery = queryField('documents', {
  type: list(documentModelInterface),
  resolve: async (_root, args, ctx: Context) => {
    if (!ctx.driveId) {
      throw new Error('DriveId is not defined');
    }
    try {
      const docIds = await ctx.prisma.document.getDocuments(ctx.driveId);
      const docs = await Promise.all(
        docIds.map(async (id) => {
          const doc = await ctx.prisma.document.getDocument(ctx.driveId!, id)
          ctx.documents![doc.id] = doc;
          return doc;
        })
      );
      return docs;
    } catch (e: any) {
      logger.error({ msg: e.message });
      throw e;
    }
  }
});
