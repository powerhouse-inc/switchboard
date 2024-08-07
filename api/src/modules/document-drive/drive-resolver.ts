import {
  ListenerRevision as IListenerRevision,
  UpdateStatus as IUpdateStatus
} from 'document-drive';
import {
  DocumentDriveAction,
  DocumentDriveState
} from 'document-model-libs/document-drive';
import { Document, Operation, OperationScope } from 'document-model/document';
import stringify from 'json-stringify-deterministic';
import {
  enumType,
  idArg,
  inputObjectType,
  list,
  mutationField,
  nonNull,
  objectType,
  queryField
} from 'nexus';
import BadRequestError from '../../errors/BadRequestError';
import DocumentDriveError from '../../errors/DocumentDriveError';
import { Context } from '../../graphql/server/drive/context';
import { getChildLogger } from '../../logger';
import { systemType } from '../system';
import { verifyOperationsAndSignature } from '../document/utils';
import ForbiddenError from '../../errors/ForbiddenError';

const logger = getChildLogger({ msgPrefix: 'Drive Resolver' });

export const Node = objectType({
  name: 'Node',
  definition(t) {
    t.nonNull.string('id');
    t.nonNull.string('name');
    t.nonNull.string('kind');
    t.string('documentType');
    t.string('parentFolder');
  }
});


export const DocumentDriveStateObject = objectType({
  name: 'DocumentDriveState',
  definition(t) {
    t.nonNull.id('id');
    t.nonNull.string('name');
    t.nonNull.list.field('nodes', { type: Node });
    t.string('icon');
    t.string('slug');
    t.string("sharingType");
    t.nonNull.boolean("availableOffline");
  }
});

// v2
export const UpdateStatus = enumType({
  name: 'UpdateStatus',
  members: ['SUCCESS', 'MISSING', 'CONFLICT', 'ERROR']
});

export const InputListenerFilter = inputObjectType({
  name: 'InputListenerFilter',
  definition(t) {
    t.list.string('documentType');
    t.list.string('documentId');
    t.list.string('scope');
    t.list.string('branch');
  }
});

export const ListenerRevisionInput = inputObjectType({
  name: 'ListenerRevisionInput',
  definition(t) {
    t.nonNull.string('driveId');
    t.nonNull.string('documentId');
    t.nonNull.string('scope');
    t.nonNull.string('branch');
    t.nonNull.field('status', { type: UpdateStatus });
    t.nonNull.int('revision');
  }
});

export const ListenerRevision = objectType({
  name: 'ListenerRevision',
  definition(t) {
    t.nonNull.string('driveId');
    t.string('documentId');
    t.nonNull.string('scope');
    t.nonNull.string('branch');
    t.nonNull.field('status', { type: UpdateStatus });
    t.nonNull.int('revision');
    t.string('error');
  }
});

export const OperationSignerUser = objectType({
  name: 'OperationSignerUser',
  definition(t) {
    t.nonNull.string('address');
    t.nonNull.string('networkId');
    t.nonNull.int('chainId');
  }
});

export const OperationSignerApp = objectType({
  name: 'OperationSignerApp',
  definition(t) {
    t.nonNull.string('name');
    t.nonNull.string('key');
  }
});

export const OperationSigner = objectType({
  name: 'OperationSigner',
  definition(t) {
    t.nonNull.field('user', { type: OperationSignerUser });
    t.nonNull.field('app', { type: OperationSignerApp });
    t.nonNull.list.nonNull.list.nonNull.field('signatures', { type: 'String' });
  }
});

export const OperationContext = objectType({
  name: 'OperationContext',
  definition(t) {
    t.field('signer', { type: OperationSigner });
  }
});

export const OperationUpdate = objectType({
  name: 'OperationUpdate',
  definition(t) {
    t.string('id');
    t.nonNull.int('index');
    t.nonNull.int('skip');
    t.nonNull.string('type');
    t.nonNull.string('input');
    t.nonNull.string('hash');
    t.nonNull.string('timestamp');
    t.field('context', { type: OperationContext });
  }
});

export const InputOperationSignerUser = inputObjectType({
  name: 'InputOperationSignerUser',
  definition(t) {
    t.nonNull.string('address');
    t.nonNull.string('networkId');
    t.nonNull.int('chainId');
  }
});

export const InputOperationSignerApp = inputObjectType({
  name: 'InputOperationSignerApp',
  definition(t) {
    t.nonNull.string('name');
    t.nonNull.string('key');
  }
});

export const InputOperationSigner = inputObjectType({
  name: 'InputOperationSigner',
  definition(t) {
    t.nonNull.field('user', { type: InputOperationSignerUser });
    t.nonNull.field('app', { type: InputOperationSignerApp });
    t.nonNull.list.nonNull.list.nonNull.field('signatures', { type: 'String' });
  }
});

export const InputOperationContext = inputObjectType({
  name: 'InputOperationContext',
  definition(t) {
    t.field('signer', { type: InputOperationSigner });
  }
});

export const InputOperationUpdate = inputObjectType({
  name: 'InputOperationUpdate',
  definition(t) {
    t.nonNull.int('index');
    t.int('skip');
    t.nonNull.string('type');
    t.nonNull.string('id');
    t.nonNull.string('input');
    t.nonNull.string('hash');
    t.nonNull.string('timestamp');
    t.string('id');
    t.field('context', { type: InputOperationContext });
  }
});

export const IStrandUpdate = objectType({
  name: 'StrandUpdate',
  definition(t) {
    t.nonNull.string('driveId');
    t.nonNull.string('documentId');
    t.nonNull.string('scope');
    t.nonNull.string('branch');
    t.nonNull.list.nonNull.field('operations', { type: OperationUpdate });
  }
});

export const InputStrandUpdate = inputObjectType({
  name: 'InputStrandUpdate',
  definition(t) {
    t.nonNull.string('driveId');
    t.string('documentId');
    t.nonNull.string('scope');
    t.nonNull.string('branch');
    t.nonNull.list.nonNull.field('operations', { type: InputOperationUpdate });
  }
});

export const ListenerFilter = objectType({
  name: 'ListenerFilter',
  definition(t) {
    t.nonNull.list.nonNull.string('documentType');
    t.list.nonNull.id('documentId');
    t.list.nonNull.string('scope');
    t.list.nonNull.string('branch');
  }
});

export const TransmitterType = enumType({
  name: 'TransmitterType',
  members: [
    'Internal',
    'SwitchboardPush',
    'PullResponder',
    'SecureConnect',
    'MatrixConnect',
    'RESTWebhook'
  ]
});

export const ListenerCallInfo = objectType({
  name: 'ListenerCallInfo',
  definition(t) {
    t.field('transmitterType', { type: TransmitterType });
    t.string('name');
    t.string('data');
  }
});

export const Listener = objectType({
  name: 'Listener',
  definition(t) {
    t.nonNull.id('listenerId');
    t.string('label');
    t.nonNull.boolean('block');
    t.nonNull.boolean('system');
    t.nonNull.field('filter', { type: ListenerFilter });
    t.field('callInfo', { type: ListenerCallInfo });
  }
});

export const syncType = objectType({
  name: 'Sync',
  definition(t) {
    t.field('strands', {
      type: list(IStrandUpdate),
      args: {
        listenerId: idArg(),
        since: 'Date'
      },
      resolve: async (_parent, { listenerId, since }, ctx: Context) => {
        if (!listenerId) throw new Error('Listener ID is required');
        try {
          const result = await ctx.prisma.document.pullStrands(
            ctx.driveId ?? '1',
            listenerId,
            since
          );
          return result.map(e => ({
            driveId: e.driveId,
            documentId: e.documentId,
            scope: e.scope,
            branch: e.branch,
            operations: e.operations.map(o => ({
              index: o.index,
              skip: o.skip,
              name: o.type,
              input: stringify(o.input),
              hash: o.hash,
              timestamp: o.timestamp,
              type: o.type,
              context: o.context,
              id: o.id
            }))
          }));
        } catch (e) {
          if ((e as Error).message?.match(/Transmitter .+ not found/)) {
            throw new BadRequestError({
              message: (e as Error).message ?? 'Transmitter not found'
            });
          } else {
            logger.error(e);
            throw new Error('Failed to fetch strands');
          }
        }
      }
    });
  }
});

export const driveSystemType = objectType({
  name: 'SwitchboardDrive',
  definition(t) {
    t.implements(systemType);
    t.field('sync', {
      type: syncType,
      resolve: async () => true
    });
  }
});

export const driveSystemQueryField = queryField('system', {
  type: driveSystemType,
  resolve: async () => true
});

export const getDrive = queryField('drive', {
  type: DocumentDriveStateObject,
  resolve: async (_parent, _args, ctx: Context) => {
    try {
      const {global, local} = (await ctx.prisma.document.getDrive(
        ctx.driveId ?? '1'
      )) ;
      return {...global, ...local, sharingType: local.sharingType?.toUpperCase() ?? null};
    } catch (e: any) {
      throw new DocumentDriveError({
        code: 500,
        message: e.message ?? 'Failed to get drive',
        logging: true,
        context: e
      });
    }
  }
});

export const registerListener = mutationField('registerPullResponderListener', {
  type: Listener,
  args: {
    filter: nonNull(InputListenerFilter)
  },
  resolve: async (_parent, { filter }, ctx: Context) => {
    try {
      const result = await ctx.prisma.document.registerPullResponderListener(
        ctx.driveId ?? '1',
        {
          branch: (filter.branch?.filter(b => !!b) as string[]) ?? [],
          documentId: (filter.documentId?.filter(b => !!b) as string[]) ?? [],
          documentType:
            (filter.documentType?.filter(b => !!b) as string[]) ?? [],
          scope: (filter.scope?.filter(b => !!b) as string[]) ?? []
        }
      );

      return result;
    } catch (e: any) {
      throw new DocumentDriveError({
        code: 500,
        message: e.message ?? 'Failed to register listener',
        logging: true,
        context: e
      });
    }
  }
});

export const deleteListener = mutationField('deletePullResponderListener', {
  type: Listener,
  args: {
    filter: nonNull(InputListenerFilter)
  },
  resolve: async (_parent, { filter }, ctx: Context) => {
    try {
      const result = await ctx.prisma.document.deletePullResponderListener(
        ctx.driveId ?? '1',
        filter
      );

      return result;
    } catch (e: any) {
      throw new DocumentDriveError({
        code: 500,
        message: e.message ?? 'Failed to delete listener',
        logging: true,
        context: e
      });
    }
  }
});

export const pushUpdates = mutationField('pushUpdates', {
  type: list(ListenerRevision),
  args: {
    strands: list(nonNull(InputStrandUpdate))
  },
  resolve: async (_parent, { strands }, ctx: Context) => {
    logger.info('pushUpdates');
    if (!strands || strands?.length === 0) return [];

    try {
      const listenerRevisions: IListenerRevision[] = await Promise.all(
        strands.map(async s => {
          const operations =
            s.operations?.map(o => ({
              ...o,
              input: JSON.parse(o.input),
              skip: o.skip ?? 0,
              scope: s.scope as OperationScope,
              branch: 'main'
            })) ?? [];

          logger.info(`Drive Id and DocumentId${s.driveId} ${s.documentId}`);

          const id = s.documentId && s.documentId !== "" ? s.documentId : s.driveId;


          const existingOperations = await ctx.prisma.document.getOperations(
            s.driveId, s.documentId ? s.documentId : undefined
          );
          const verified = await verifyOperationsAndSignature(
            id,
            existingOperations[s.scope as OperationScope],
            operations as Operation[]
          )
          if (!verified) { // todo fix this
            throw new ForbiddenError({
              message: 'Invalid operation signature'
            });
          }
          const result = await ctx.prisma.document.pushUpdates(
            s.driveId,
            operations as Operation<DocumentDriveAction>[],
            s.documentId ?? undefined
          );

          if (result.status !== 'SUCCESS') logger.error(result.error);

          const revision =
            result.document?.operations[s.scope as OperationScope].slice().pop()
              ?.index ?? -1;

          return {
            revision,
            branch: s.branch,
            documentId: s.documentId ?? '',
            driveId: s.driveId,
            scope: s.scope as OperationScope,
            status: result.status,
            error: result.error?.message
          };
        })
      );

      return listenerRevisions;
    } catch (e: any) {
      throw new DocumentDriveError({
        code: 500,
        message: e.message ?? 'Failed to push updates',
        logging: true,
        context: e
      });
    }
  }
});

export const acknowledge = mutationField('acknowledge', {
  type: 'Boolean',
  args: {
    listenerId: nonNull('String'),
    revisions: list(ListenerRevisionInput)
  },
  resolve: async (_parent, { revisions, listenerId }, ctx: Context) => {
    try {
      if (!listenerId || !revisions) return false;
      const validEntries: IListenerRevision[] = revisions
        .filter(r => r !== null)
        .map(e => ({
          driveId: e!.driveId,
          documentId: e!.documentId,
          scope: e!.scope,
          branch: e!.branch,
          revision: e!.revision,
          status: e!.status as IUpdateStatus
        }));

      const result = await ctx.prisma.document.processAcknowledge(
        ctx.driveId ?? '1',
        listenerId,
        validEntries
      );

      return result;
    } catch (e: any) {
      throw new DocumentDriveError({
        code: 500,
        message: e.message ?? 'Failed to acknowledge',
        logging: true,
        context: e
      });
    }
  }
});
