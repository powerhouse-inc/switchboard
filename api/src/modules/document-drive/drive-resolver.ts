import {
  enumType,
  idArg,
  inputObjectType,
  list,
  objectType,
  queryField,
} from 'nexus';
import { systemType } from '../system';

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

export const StrandUpdate = objectType({
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
      type: list(StrandUpdate),
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
          return result.map((e) => ({
            driveId: e.driveId,
            documentId: e.documentId,
            scope: e.scope,
            branch: e.branch,
            operations: e.operations.map((o) => ({
              revision: o.index,
              skip: o.skip,
              name: o.type,
              inputJson: JSON.stringify(o.input),
              stateHash: o.hash,
            })),
          }));
        } catch (e) {
          throw new Error('Failed to fetch strands');
        }
      },
    });
  },
});

export const driveSystemType = objectType({
  name: 'DriveSystem',
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
