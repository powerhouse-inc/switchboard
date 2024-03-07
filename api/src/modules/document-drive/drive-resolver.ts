import {
  enumType,
  idArg,
  inputObjectType,
  list,
  mutationField,
  nonNull,
  objectType,
  queryField,
} from 'nexus';
import { systemType } from '../system';
import {
  ListenerRevision as IListenerRevision, UpdateStatus as IUpdateStatus, StrandUpdate,
} from 'document-drive';
import { OperationScope } from 'document-model/document';
import stringify from 'json-stringify-deterministic';
import { getChildLogger } from '../../logger';

const logger = getChildLogger({ msgPrefix: 'Drive Resolver' });

export const Node = objectType({
  name: 'Node',
  definition(t) {
    t.nonNull.string('id');
    t.nonNull.string('name');
    t.nonNull.string('kind');
    t.string('documentType');
    t.string('parentFolder');
  },
});

export const DocumentDriveState = objectType({
  name: 'DocumentDriveState',
  definition(t) {
    t.nonNull.id('id');
    t.nonNull.string('name');
    t.nonNull.list.field('nodes', { type: Node });
    t.string('icon');
    t.string('slug');
  },
});

// v2
export const UpdateStatus = enumType({
  name: 'UpdateStatus',
  members: ['SUCCESS', 'MISSING', 'CONFLICT', 'ERROR'],
});

export const InputListenerFilter = inputObjectType({
  name: 'InputListenerFilter',
  definition(t) {
    t.list.string('documentType');
    t.list.string('documentId');
    t.list.string('scope');
    t.list.string('branch');
  },
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
  },
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
  },
});

export const OperationUpdate = objectType({
  name: 'OperationUpdate',
  definition(t) {
    t.nonNull.int('index');
    t.nonNull.int('skip');
    t.nonNull.string('type');
    t.nonNull.string('input');
    t.nonNull.string('hash');
    t.nonNull.string('timestamp');
  },
});

export const InputOperationUpdate = inputObjectType({
  name: 'InputOperationUpdate',
  definition(t) {
    t.nonNull.int('index');
    t.int('skip');
    t.nonNull.string('type');
    t.nonNull.string('input');
    t.nonNull.string('hash');
    t.nonNull.string('timestamp');
  },
});

export const IStrandUpdate = objectType({
  name: 'StrandUpdate',
  definition(t) {
    t.nonNull.string('driveId');
    t.nonNull.string('documentId');
    t.nonNull.string('scope');
    t.nonNull.string('branch');
    t.nonNull.list.nonNull.field('operations', { type: OperationUpdate });
  },
});

export const InputStrandUpdate = inputObjectType({
  name: 'InputStrandUpdate',
  definition(t) {
    t.nonNull.string('driveId');
    t.string('documentId');
    t.nonNull.string('scope');
    t.nonNull.string('branch');
    t.nonNull.list.nonNull.field('operations', { type: InputOperationUpdate });
  },
});

export const ListenerFilter = objectType({
  name: 'ListenerFilter',
  definition(t) {
    t.nonNull.list.nonNull.string('documentType');
    t.list.nonNull.id('documentId');
    t.list.nonNull.string('scope');
    t.list.nonNull.string('branch');
  },
});

export const TransmitterType = enumType({
  name: 'TransmitterType',
  members: [
    'Internal',
    'SwitchboardPush',
    'PullResponder',
    'SecureConnect',
    'MatrixConnect',
    'RESTWebhook',
  ],
});

export const ListenerCallInfo = objectType({
  name: 'ListenerCallInfo',
  definition(t) {
    t.field('transmitterType', { type: TransmitterType });
    t.string('name');
    t.string('data');
  },
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
  },
});

export const syncType = objectType({
  name: 'Sync',
  definition(t) {
    t.field('strands', {
      type: list(IStrandUpdate),
      args: {
        listenerId: idArg(),
        since: 'Date',
      },
      resolve: async (_parent, { listenerId, since }, ctx) => {
        if (!listenerId) throw new Error('Listener ID is required');
        try {
          const result = await ctx.prisma.document.pullStrands(
            ctx.driveId ?? '1',
            listenerId,
            since,
          );
          return result.map((e: StrandUpdate) => ({
            driveId: e.driveId,
            documentId: e.documentId,
            scope: e.scope,
            branch: e.branch,
            operations: e.operations.map((o) => ({
              index: o.index,
              skip: o.skip,
              name: o.type,
              input: stringify(o.input),
              hash: o.hash,
              timestamp: o.timestamp,
              type: o.type,
            })),
          }));
        } catch (e) {
          logger.error(e);
          throw new Error('Failed to fetch strands');
        }
      },
    });
  },
});

export const driveSystemType = objectType({
  name: 'SwitchboardDrive',
  definition(t) {
    t.implements(systemType);
    t.field('sync', {
      type: syncType,
      resolve: async () => true,
    });
  },
});

export const driveSystemQueryField = queryField('system', {
  type: driveSystemType,
  resolve: async () => true,
});

export const getDrive = queryField('drive', {
  type: DocumentDriveState,
  resolve: async (_parent, args, ctx) => {
    try {
      const drive = await ctx.prisma.document.getDrive(ctx.driveId ?? '1');
      return drive.global;
    } catch (e) {
      return null;
    }
  },
});

export const registerListener = mutationField('registerPullResponderListener', {
  type: Listener,
  args: {
    filter: nonNull(InputListenerFilter),
  },
  resolve: async (_parent, { filter }, ctx) => {
    const result = await ctx.prisma.document.registerPullResponderListener(
      ctx.driveId ?? '1',
      filter,
    );

    return result;
  },
});


export const deleteListener = mutationField('deletePullResponderListener', {
  type: Listener,
  args: {
    filter: nonNull(InputListenerFilter),
  },
  resolve: async (_parent, { filter }, ctx) => {
    const result = await ctx.prisma.document.deletePullResponderListener(
      ctx.driveId ?? '1',
      filter,
    );

    return result;
  },
});

export const pushUpdates = mutationField('pushUpdates', {
  type: list(ListenerRevision),
  args: {
    strands: list(nonNull(InputStrandUpdate)),
  },
  resolve: async (_parent, { strands }, ctx) => {
    logger.info('pushUpdates')
    if (!strands || strands?.length === 0) return [];

    const listenerRevisions: IListenerRevision[] = await Promise.all(strands.map(async (s) => {
      const operations = s.operations?.map((o) => ({
        ...o,
        input: JSON.parse(o.input),
        skip: o.skip ?? 0,
        scope: s.scope as OperationScope,
        branch: 'main',
        scopes: ['global', 'local'],
      })) ?? [];

      const result = await ctx.prisma.document.pushUpdates(
        s.driveId,
        operations,
        s.documentId ?? undefined,
      );

      if (result.status !== "SUCCESS") logger.error(result.error);

      const revision = result.document.operations[s.scope].slice().pop()?.index ?? -1;
      return {
        revision,
        branch: s.branch,
        documentId: s.documentId ?? '',
        driveId: s.driveId,
        scope: s.scope as OperationScope,
        status: result.status,
      };
    }));

    return listenerRevisions;
  },
});

export const acknowledge = mutationField('acknowledge', {
  type: 'Boolean',
  args: {
    listenerId: nonNull('String'),
    revisions: list(ListenerRevisionInput),
  },
  resolve: async (_parent, { revisions, listenerId }, ctx) => {
    try {
      if (!listenerId || !revisions) return false;
      const validEntries: IListenerRevision[] = revisions
        .filter((r) => r !== null)
        .map((e) => ({
          driveId: e!.driveId,
          documentId: e!.documentId,
          scope: e!.scope,
          branch: e!.branch,
          revision: e!.revision,
          status: e!.status as IUpdateStatus,
        }));

      const result = await ctx.prisma.document.processAcknowledge(
        ctx.driveId,
        listenerId,
        validEntries,
      );

      return result;
    } catch (e) {
      logger.error(e)
      return false;
    }
  },
});
