import type { Prisma } from '@prisma/client';
import {
  CreateDocumentInput,
  DocumentDriveServer,
  DriveInput,
  FilesystemStorage,
  MemoryStorage,
  PrismaStorage,
} from 'document-drive';
import * as DocumentModelsLibs from 'document-model-libs/document-models';
import { module as DocumentModelLib } from 'document-model/document-model';
import {
  BaseAction,
  DocumentModel,
  Operation,
} from 'document-model/dist/browser/document';
import { DocumentDriveAction } from 'document-model-libs/dist/document-models/document-drive';
export function getDocumentDriveCRUD(prisma: Prisma.TransactionClient) {
  const documentModels = [
    DocumentModelLib,
    ...Object.values(DocumentModelsLibs),
  ] as DocumentModel[];
  const driveServer = new DocumentDriveServer(
    documentModels,
    new PrismaStorage(prisma),
  );

  return {
    addDrive: async (args: DriveInput) => {
      await driveServer.addDrive(args);
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

    addDocument: async (driveId: string, input: CreateDocumentInput) => {
      try {
        await driveServer.createDocument(driveId, input);
      } catch (e) {
        console.log(e);
        return false;
      }

      return true;
    },

    addOperation: async (
      driveId: string,
      documentId: string,
      operation: Operation,
    ) => {
      return await driveServer.addOperation(driveId, documentId, operation);
    },

    addDriveOperations: async (driveId: string, operations: Operation[]) => {
      const result = await driveServer.addDriveOperations(driveId, operations);
      return result;
    },
  };
}
