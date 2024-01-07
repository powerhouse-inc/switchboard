import { inputObjectType, interfaceType, objectType, unionType } from 'nexus';

export const DocumentDriveLocalState = objectType({
  name: 'DocumentDriveLocalState',
  definition(t) {
    t.string('sharingType');
    t.nonNull.boolean('availableOffline');
  },
});
export const DocumentDriveState = objectType({
  name: 'DocumentDriveState',
  definition(t) {
    t.nonNull.id('id');
    t.nonNull.string('name');
    // t.nonNull.list.nonNull.field('nodes', { type: UnionNode });
    t.string('icon');
    t.string('remoteUrl');
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

export const UnionNode = unionType({
  name: 'Node',
  resolveType(node) {
    return node.kind === 'file' ? 'FileNode' : 'FolderNode';
  },
  definition(t) {
    t.members(FolderNode, FileNode);
  },
});

export const CreateDocumentInput = inputObjectType({
  name: 'CreateDocumentInput',
  definition(t) {
    t.nonNull.id('id');
    t.nonNull.string('documentType');
  },
});

export const Document = interfaceType({
  name: 'Document',
  resolveType: (document) => {
    switch (document.documentType) {
      case 'document-drive':
        return 'DocumentDriveDocument';
      default:
        return null;
    }
  },
  definition(t) {
    t.nonNull.string('id', { resolve: (doc) => doc.id });
    t.nonNull.string('name', { resolve: (doc) => doc.name });
    t.nonNull.string('documentType', { resolve: (doc) => doc.documentType });
    t.nonNull.string('lastModified', { resolve: (doc) => doc.lastModified });
    t.nonNull.string('revision', { resolve: (doc) => doc.revision });
    t.nonNull.string('created', { resolve: (doc) => doc.created });
  },
});
