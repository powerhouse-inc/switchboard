/* eslint-disable @typescript-eslint/no-use-before-define */
import {
  enumType,
  interfaceType,
  objectType,
  scalarType,
  unionType
} from 'nexus';
import { documentModelInterface } from '../document/resolvers';

export const DocumentDriveLocalState = objectType({
  name: 'DocumentDriveLocalState',
  definition(t) {
    t.string('sharingType');
    t.nonNull.boolean('availableOffline');
    t.nonNull.list.nonNull.field('listeners', { type: Listener });
    t.nonNull.list.nonNull.field('triggers', { type: Trigger });
  }
});

export const DocumentDriveState = objectType({
  name: 'DocumentDriveState',
  definition(t) {
    t.nonNull.id('id');
    t.nonNull.string('name');
    t.nonNull.list.nonNull.field('nodes', { type: Node });
    t.string('icon');
    t.string('slug');
  }
});

export const FileNode = objectType({
  name: 'FileNode',
  definition(t) {
    t.implements(Node);
    t.nonNull.string('documentType');
    t.nonNull.list.nonNull.field('synchronizationUnits', {
      type: SynchronizationUnit
    });
  }
});

export const FolderNode = objectType({
  name: 'FolderNode',
  definition(t) {
    t.implements(Node);
  }
});

export const Listener = objectType({
  name: 'Listener',
  definition: t => {
    t.nonNull.id('listenerId');
    t.string('label');
    t.nonNull.boolean('block');
    t.nonNull.boolean('system');
    t.nonNull.field('filter', { type: ListenerFilter });
    t.field('callInfo', { type: ListenerCallInfo });
  }
});

export const ListenerCallInfo = objectType({
  name: 'ListenerCallInfo',
  definition(t) {
    t.field('transmitterType', { type: TransmitterType });
    t.string('name');
    t.string('data');
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

export const PullResponderTriggerData = objectType({
  name: 'PullResponderTriggerData',
  definition(t) {
    t.nonNull.id('listenerId');
    t.nonNull.string('url');
    t.nonNull.string('interval');
  }
});

export const SynchronizationUnit = objectType({
  name: 'SynchronizationUnit',
  definition(t) {
    t.nonNull.id('syncId');
    t.nonNull.string('scope');
    t.nonNull.string('branch');
  }
});

export const Trigger = objectType({
  name: 'Trigger',
  definition(t) {
    t.nonNull.id('id');
    t.nonNull.field('type', { type: TriggerType });
    t.field('data', { type: TriggerData });
  }
});

export const Node = interfaceType({
  name: 'Node',
  definition(t) {
    t.nonNull.string('id');
    t.nonNull.string('name');
    t.nonNull.string('kind');
    t.string('parentFolder');
  },
  resolveType: t => (t.kind === 'folder' ? 'FolderNode' : 'FileNode')
});

export const TriggerData = unionType({
  name: 'TriggerData',
  definition(t) {
    t.members(PullResponderTriggerData);
  },
  resolveType: () => 'PullResponderTriggerData' // TODO add support for other triggers
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

export const TriggerType = enumType({
  name: 'TriggerType',
  members: ['PullResponder']
});

export const Unknown = scalarType({
  name: 'Unknown',
  serialize(value) {
    return JSON.stringify(value);
  },
  parseValue(value) {
    return JSON.parse(value as string);
  }
});

export const DocumentDriveDocument = objectType({
  name: 'DocumentDrive',
  definition(t) {
    t.implements(documentModelInterface);
    t.nonNull.field('state', { type: DocumentDriveState });
    t.nonNull.field('initialState', { type: DocumentDriveState });
  }
});
