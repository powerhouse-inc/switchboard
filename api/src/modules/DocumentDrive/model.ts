import type { Prisma } from "@prisma/client";
import {
  DocumentDriveServer,
  DriveInput,
  Listener,
  ListenerRevision,
  MemoryStorage,
  PrismaStorage,
  generateUUID,
} from "document-drive";
import * as DocumentModelsLibs from "document-model-libs/document-models";
import { module as DocumentModelLib } from "document-model/document-model";
import { DocumentModel, Operation } from "document-model/dist/browser/document";
import { PullResponderTransmitter } from "document-drive/src/transmitter/pull-responder";
import {
  utils as DocumentDriveUtils,
  ListenerFilter,
  actions,
  reducer,
} from "document-model-libs/dist/document-drive";

export function getDocumentDriveCRUD(prisma: Prisma.TransactionClient) {
  const documentModels = [
    DocumentModelLib,
    ...Object.values(DocumentModelsLibs),
  ] as DocumentModel[];

  const driveServer = new DocumentDriveServer(
    documentModels,
    new MemoryStorage()
  );

  return {
    addDrive: async (args: DriveInput) => {
      const drive = await driveServer.addDrive(args);
      return {
        ...args,
      };
    },
    deleteDrive: async (id: string) => {
      await driveServer.deleteDrive(id);
      return { id };
    },
    getDrive: async (id: string) => {
      const { state } = await driveServer.getDrive(id);
      return state;
    },

    getDrives: async () => {
      const drives = await driveServer.getDrives();
      return drives;
    },

    getDocument: (driveId: string, documentId: string) => {
      return driveServer.getDocument(driveId, documentId);
    },

    getDocuments: (driveId: string) => {
      return driveServer.getDocuments(driveId);
    },

    deleteDocument: async (driveId: string, documentId: string) => {
      try {
        await driveServer.deleteDocument(driveId, documentId);
      } catch (e) {
        return false;
      }

      return true;
    },

    addDocument: async (input: DriveInput) => {
      try {
        await driveServer.addDrive(input);
      } catch (e) {
        console.log(e);
        return false;
      }

      return true;
    },

    addOperation: async (
      driveId: string,
      documentId: string,
      operation: Operation
    ) => {
      return await driveServer.addOperation(driveId, documentId, operation);
    },

    addDriveOperations: async (driveId: string, operations: Operation[]) => {
      const result = await driveServer.addDriveOperations(driveId, operations);
      return result;
    },
    addOperations: async (
      driveId: string,
      documentId: string,
      operations: Operation[]
    ) => {
      const result = await driveServer.addOperations(
        driveId,
        documentId,
        operations
      );
      return result;
    },

    pushUpdates: async (
      driveId: string,
      documentId: string,
      operations: Operation[]
    ) => {
      const result = await driveServer.addOperations(
        driveId,
        documentId,
        operations
      );
      return result;
    },

    pullStrands: async (
      driveId: string,
      listenerId: string,
      since?: string
    ) => {
      const transmitter = (await driveServer.getTransmitter(
        driveId,
        listenerId
      )) as PullResponderTransmitter;
      if (!transmitter) {
        throw new Error(`Transmitter with id ${listenerId} not found`);
      }

      const result = await transmitter.getStrands(listenerId, since);
      return result;
    },

    acknowledgeStrands: async (
      driveId: string,
      listenerId: string,
      revisions: ListenerRevision[]
    ) => {
      const transmitter = (await driveServer.getTransmitter(
        driveId,
        listenerId
      )) as PullResponderTransmitter;
      if (!transmitter) {
        throw new Error(`Transmitter with id ${listenerId} not found`);
      }
      return await transmitter.acknowledgeStrands(
        listenerId,
        driveId,
        revisions
      );
    },

    registerListener: async (driveId: string, filter: ListenerFilter) => {
      const uuid = generateUUID();
      const listener: Listener = {
        block: false,
        callInfo: {
          data: "",
          name: "PullResponder",
          transmitterType: "PullResponder",
        },
        filter,
        label: `Pullresponder #${uuid}`,
        listenerId: uuid,
        system: false,
      };
      const action = actions.addListener({
        listener,
      });

      await driveServer.addDriveOperations(driveId, [action]);
      return listener;
    },
  };
}
