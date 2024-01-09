import {
  arg,
  enumType,
  idArg,
  inputObjectType,
  interfaceType,
  list,
  nonNull,
  objectType,
  stringArg,
  unionType,
} from 'nexus';

export const DocumentDriveLocalState = objectType({
  name: 'DocumentDriveLocalState',
  definition(t) {
    t.string('sharingType');
    t.nonNull.boolean('availableOffline');
  },
});

export const DocumentDriveLocalStateInput = inputObjectType({
  name: 'DocumentDriveLocalStateInput',
  definition(t) {
    t.string('sharingType');
    t.nonNull.boolean('availableOffline');
  },
});
export const DocumentDriveStateInput = inputObjectType({
  name: 'DocumentDriveStateInput',
  definition(t) {
    t.nonNull.id('id');
    t.nonNull.string('name');
    t.string('icon');
    t.string('remoteUrl');
  },
});

export const AddFileInput = inputObjectType({
  name: 'AddFileInput',
  definition(t) {
    t.nonNull.id('id');
    t.nonNull.string('name');
    t.nonNull.string('documentType');
    t.id('parentFolder');
  },
});

export const AddFolderInput = inputObjectType({
  name: 'AddFolderInput',
  definition(t) {
    t.nonNull.id('id');
    t.nonNull.string('name');
    t.id('parentFolder');
  },
});

export const CopyNodeInput = inputObjectType({
  name: 'CopyNodeInput',
  definition(t) {
    t.nonNull.id('srcId');
    t.nonNull.id('targetId');
    t.string('targetName');
    t.id('targetParentFolder');
  },
});

export const DeleteNodeInput = inputObjectType({
  name: 'DeleteNodeInput',
  definition(t) {
    t.nonNull.id('id');
  },
});

export const MoveNodeInput = inputObjectType({
  name: 'MoveNodeInput',
  definition(t) {
    t.nonNull.id('srcFolder');
    t.id('targetParentFolder');
  },
});

export const SetSharingTypeInput = inputObjectType({
  name: 'SetSharingTypeInput',
  definition(t) {
    t.nonNull.string('type');
  },
});

export const SetAvailableOfflineInput = inputObjectType({
  name: 'SetAvailableOfflineInput',
  definition(t) {
    t.nonNull.boolean('availableOffline');
  },
});

export const SetDriveNameInput = inputObjectType({
  name: 'SetDriveNameInput',
  definition(t) {
    t.nonNull.string('name');
  },
});

export const UpdateFileInput = inputObjectType({
  name: 'UpdateFileInput',
  definition(t) {
    t.nonNull.id('id');
    t.id('parentFolder');
    t.string('name');
    t.string('documentType');
  },
});

export const UpdateNodeInput = inputObjectType({
  name: 'UpdateNodeInput',
  definition(t) {
    t.nonNull.id('id');
    t.id('parentFolder');
    t.string('name');
  },
});

export const FileNode = objectType({
  name: 'FileNode',
  definition(t) {
    t.nonNull.string('id');
    t.nonNull.string('name');
    t.nonNull.string('kind');
    t.nonNull.string('documentType');
    t.string('parentFolder');
  },
});
export const FolderNode = objectType({
  name: 'FolderNode',
  definition(t) {
    t.nonNull.string('id');
    t.nonNull.string('name');
    t.nonNull.string('kind');
    t.string('parentFolder');
  },
});

export const Node = unionType({
  name: 'Node',
  resolveType(node) {
    if (node.kind === 'folder') {
      return FolderNode;
    }

    return FileNode;
  },
  definition(t) {
    t.members(FileNode, FolderNode);
  },
});

export const DocumentDriveState = objectType({
  name: 'DocumentDriveState',
  definition(t) {
    t.nonNull.id('id');
    t.nonNull.string('name');
    t.nonNull.list.field('nodes', { type: Node });
    t.string('icon');
    t.string('remoteUrl');
  },
});

// v2
export const ListenerRevision = inputObjectType({
  name: 'InputListenerRevision',
  definition(t) {
    t.nonNull.string('driveId');
    t.nonNull.string('documentId');
    t.nonNull.string('scope');
    t.nonNull.string('branch');
    t.nonNull.field('status', { type: UpdateStatus });
    t.nonNull.int('revision');
  },
});
export const OperationUpdate = objectType({
  name: 'OperationUpdate',
  definition(t) {
    t.nonNull.int('revision');
    t.nonNull.int('skip');
    t.nonNull.string('name');
    t.nonNull.string('inputJson');
    t.nonNull.string('stateHash');
  },
});

export const InputOperationUpdate = inputObjectType({
  name: 'InputOperationUpdate',
  definition(t) {
    t.nonNull.int('revision');
    t.nonNull.int('skip');
    t.nonNull.string('name');
    t.nonNull.string('inputJson');
    t.nonNull.string('stateHash');
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
    t.nonNull.string('documentId');
    t.nonNull.string('scope');
    t.nonNull.string('branch');
    t.nonNull.list.nonNull.field('operations', { type: InputOperationUpdate });
  },
});

export const UpdateStatus = enumType({
  name: 'UpdateStatus',
  members: ['SUCCESS', 'MISSING', 'CONFLICT', 'ERROR'],
});
