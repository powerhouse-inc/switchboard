import type { Prisma } from '@prisma/client';
import {
  CreateDocumentInput,
  DocumentDriveServer,
  DriveInput,
  FilesystemStorage,
  MemoryStorage,
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
    new MemoryStorage(),
  );

  // getDrives(): Promise<string[]>;
  //   addDrive(drive: DriveInput): Promise<void>;
  //   deleteDrive(id: string): Promise<void>;
  //   getDrive(id: string): Promise<DocumentDriveDocument>;

  //   getDocuments: (drive: string) => Promise<string[]>;
  //   getDocument: (drive: string, id: string) => Promise<Document>;
  //   createDocument(drive: string, document: CreateDocumentInput): Promise<void>;
  //   deleteDocument(drive: string, id: string): Promise<void>;

  //   addOperation(
  //       drive: string,
  //       id: string,
  //       operation: Operation
  //   ): Promise<IOperationResult>;
  //   addOperations(
  //       drive: string,
  //       id: string,
  //       operations: Operation[]
  //   ): Promise<IOperationResult[]>;

  //   addDriveOperation(
  //       drive: string,
  //       operation: Operation<DocumentDriveAction | BaseAction>
  //   ): Promise<IOperationResult<DocumentDriveDocument>>;
  //   addDriveOperations(
  //       drive: string,
  //       operations: Operation<DocumentDriveAction | BaseAction>[]
  //   ): Promise<IOperationResult<DocumentDriveDocument>[]>;

  return {
    addDrive: async (args: DriveInput) => {
      await driveServer.addDrive(args);
      return {
        ...args,
      };
    },
    addOperation: async (args: {
      drive: string;
      operation: Operation<any>;
    }) => {
      const op: Operation<DocumentDriveAction | BaseAction> = {
        index: 0,
        timestamp: new Date().getTime(),
      };

      // return false;
      driveServer.addDriveOperation(args.drive, args.operation);
    },
    updateDrive: () => {
      // driveServer.
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

    createDocument: async (driveId: string, input: CreateDocumentInput) => {
      try {
        await driveServer.createDocument(driveId, input);
      } catch (e) {
        return false;
      }

      return true;
    },
  };
}
