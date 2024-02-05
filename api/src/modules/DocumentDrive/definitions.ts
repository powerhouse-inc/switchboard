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
} from "nexus";

export const DocumentDriveLocalState = objectType({
  name: "DocumentDriveLocalState",
  definition(t) {
    t.string("sharingType");
    t.nonNull.boolean("availableOffline");
  },
});

export const DocumentDriveLocalStateInput = inputObjectType({
  name: "DocumentDriveLocalStateInput",
  definition(t) {
    t.string("sharingType");
    t.nonNull.boolean("availableOffline");
  },
});
export const DocumentDriveStateInput = inputObjectType({
  name: "DocumentDriveStateInput",
  definition(t) {
    t.nonNull.id("id");
    t.nonNull.string("name");
    t.string("icon");
    t.string("slug");
  },
});

export const AddFileInput = inputObjectType({
  name: "AddFileInput",
  definition(t) {
    t.nonNull.id("id");
    t.nonNull.string("name");
    t.nonNull.string("documentType");
    t.id("parentFolder");
  },
});

export const AddFolderInput = inputObjectType({
  name: "AddFolderInput",
  definition(t) {
    t.nonNull.id("id");
    t.nonNull.string("name");
    t.id("parentFolder");
  },
});

export const CopyNodeInput = inputObjectType({
  name: "CopyNodeInput",
  definition(t) {
    t.nonNull.id("srcId");
    t.nonNull.id("targetId");
    t.string("targetName");
    t.id("targetParentFolder");
  },
});

export const DeleteNodeInput = inputObjectType({
  name: "DeleteNodeInput",
  definition(t) {
    t.nonNull.id("id");
  },
});

export const MoveNodeInput = inputObjectType({
  name: "MoveNodeInput",
  definition(t) {
    t.nonNull.id("srcFolder");
    t.id("targetParentFolder");
  },
});

export const SetSharingTypeInput = inputObjectType({
  name: "SetSharingTypeInput",
  definition(t) {
    t.nonNull.string("type");
  },
});

export const SetAvailableOfflineInput = inputObjectType({
  name: "SetAvailableOfflineInput",
  definition(t) {
    t.nonNull.boolean("availableOffline");
  },
});

export const SetDriveNameInput = inputObjectType({
  name: "SetDriveNameInput",
  definition(t) {
    t.nonNull.string("name");
  },
});

export const UpdateFileInput = inputObjectType({
  name: "UpdateFileInput",
  definition(t) {
    t.nonNull.id("id");
    t.id("parentFolder");
    t.string("name");
    t.string("documentType");
  },
});

export const UpdateNodeInput = inputObjectType({
  name: "UpdateNodeInput",
  definition(t) {
    t.nonNull.id("id");
    t.id("parentFolder");
    t.string("name");
  },
});

export const Node = objectType({
  name: "Node",
  definition(t) {
    t.nonNull.string("id");
    t.nonNull.string("name");
    t.nonNull.string("kind");
    t.string("documentType");
    t.string("parentFolder");
  },
});

export const DocumentDriveState = objectType({
  name: "DocumentDriveState",
  definition(t) {
    t.nonNull.id("id");
    t.nonNull.string("name");
    t.nonNull.list.field("nodes", { type: Node });
    t.string("icon");
    t.string("slug");
  },
});

// v2
export const ListenerRevisionInput = inputObjectType({
  name: "ListenerRevisionInput",
  definition(t) {
    t.nonNull.string("driveId");
    t.nonNull.string("documentId");
    t.nonNull.string("scope");
    t.nonNull.string("branch");
    t.nonNull.field("status", { type: UpdateStatus });
    t.nonNull.int("revision");
  },
});

export const ListenerRevision = objectType({
  name: "ListenerRevision",
  definition(t) {
    t.nonNull.string("driveId");
    t.string("documentId");
    t.nonNull.string("scope");
    t.nonNull.string("branch");
    t.nonNull.field("status", { type: UpdateStatus });
    t.nonNull.int("revision");
  },
});

export const OperationUpdate = objectType({
  name: "OperationUpdate",
  definition(t) {
    t.nonNull.int("index");
    t.nonNull.int("skip");
    t.nonNull.string("type");
    t.nonNull.string("input");
    t.nonNull.string("hash");
    t.nonNull.string("timestamp");
  },
});

export const InputOperationUpdate = inputObjectType({
  name: "InputOperationUpdate",
  definition(t) {
    t.nonNull.int("index");
    t.int("skip");
    t.nonNull.string("type");
    t.nonNull.string("input");
    t.nonNull.string("hash");
    t.nonNull.string("timestamp");
  },
});

export const StrandUpdate = objectType({
  name: "StrandUpdate",
  definition(t) {
    t.nonNull.string("driveId");
    t.nonNull.string("documentId");
    t.nonNull.string("scope");
    t.nonNull.string("branch");
    t.nonNull.list.nonNull.field("operations", { type: OperationUpdate });
  },
});

export const InputStrandUpdate = inputObjectType({
  name: "InputStrandUpdate",
  definition(t) {
    t.nonNull.string("driveId");
    t.string("documentId");
    t.nonNull.string("scope");
    t.nonNull.string("branch");
    t.nonNull.list.nonNull.field("operations", { type: InputOperationUpdate });
  },
});

export const UpdateStatus = enumType({
  name: "UpdateStatus",
  members: ["SUCCESS", "MISSING", "CONFLICT", "ERROR"],
});

export const InputListenerFilter = inputObjectType({
  name: "InputListenerFilter",
  definition(t) {
    t.list.string("documentType");
    t.list.string("documentId");
    t.list.string("scope");
    t.list.string("branch");
  },
});

export const Listener = objectType({
  name: "Listener",
  definition(t) {
    t.nonNull.id("listenerId");
    t.string("label");
    t.nonNull.boolean("block");
    t.nonNull.boolean("system");
    t.nonNull.field("filter", { type: ListenerFilter });
    t.field("callInfo", { type: ListenerCallInfo });
  },
});
export const ListenerCallInfo = objectType({
  name: "ListenerCallInfo",
  definition(t) {
    t.field("transmitterType", { type: TransmitterType });
    t.string("name");
    t.string("data");
  },
});
export const ListenerFilter = objectType({
  name: "ListenerFilter",
  definition(t) {
    t.nonNull.list.nonNull.string("documentType");
    t.list.nonNull.id("documentId");
    t.list.nonNull.string("scope");
    t.list.nonNull.string("branch");
  },
});

export const TransmitterType = enumType({
  name: "TransmitterType",
  members: [
    "Internal",
    "SwitchboardPush",
    "PullResponder",
    "SecureConnect",
    "MatrixConnect",
    "RESTWebhook",
  ],
});
