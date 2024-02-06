import type { Prisma } from '@prisma/client';
import {
  DocumentDriveServer,
  DriveInput,
  ListenerRevision,
  StrandUpdate,
  generateUUID,
  PullResponderTransmitter,
  PrismaStorage
} from 'document-drive';
import * as DocumentModelsLibs from 'document-model-libs/document-models';
import { module as DocumentModelLib } from 'document-model/document-model';
import { DocumentModel, Operation } from 'document-model/document';
import {
  Listener,
  ListenerFilter,
  actions,
  reducer,
} from 'document-model-libs/document-drive';

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
      try {
        await driveServer.addDrive(args);
      } catch (e) {
        throw new Error("Couldn't add drive");
      }
      return {
        ...args,
      };
    },
    deleteDrive: async (id: string) => {
      try {
        await driveServer.deleteDrive(id);
      } catch (e) {
        throw new Error("Couldn't delete drive");
      }

      return { id };
    },
    getDrive: async (id: string) => {
      try {
        const { state } = await driveServer.getDrive(id);
        return state;
      } catch (e) {
        throw new Error("Couldn't get drive");
      }
    },
    getDrives: async () => {
      try {
        const drives = await driveServer.getDrives();
        return drives;
      } catch (e) {
        throw new Error("Couldn't get drives");
      }
    },

    pushUpdates: async (
      driveId: string,
      operations: Operation[],
      documentId?: string,
    ) => {
      if (!documentId) {
        const result = await driveServer.addDriveOperations(
          driveId,
          operations,
        );

        return result;
      }
      const result = await driveServer.addOperations(
        driveId,
        documentId,
        operations,
      );

      return result;
    },

    pullStrands: async (
      driveId: string,
      listenerId: string,
      since?: string,
    ): Promise<StrandUpdate[]> => {
      const transmitter = (await driveServer.getTransmitter(
        driveId,
        listenerId,
      )) as PullResponderTransmitter;
      if (!transmitter) {
        throw new Error(`Transmitter with id ${listenerId} not found`);
      }

      const result = await transmitter.getStrands(listenerId, since);
      return result;
    },

    processAcknowledge: async (
      driveId: string,
      listenerId: string,
      revisions: ListenerRevision[],
    ) => {
      const transmitter = (await driveServer.getTransmitter(
        driveId,
        listenerId,
      )) as PullResponderTransmitter;
      if (!transmitter) {
        throw new Error(`Transmitter with id ${listenerId} not found`);
      }
      const result = await transmitter.processAcknowledge(
        driveId,
        listenerId,
        revisions,
      );

      return result;
    },

    registerPullResponderListener: async (
      driveId: string,
      filter: ListenerFilter,
    ): Promise<Listener> => {
      const uuid = generateUUID();
      const listener: Listener = {
        block: false,
        callInfo: {
          data: '',
          name: 'PullResponder',
          transmitterType: 'PullResponder',
        },
        filter: {
          branch: filter.branch ?? [],
          documentId: filter.documentId ?? [],
          documentType: filter.documentType ?? [],
          scope: filter.scope ?? [],
        },
        label: `Pullresponder #${uuid}`,
        listenerId: uuid,
        system: false,
      };
      let drive = await driveServer.getDrive(driveId);
      drive = reducer(drive, actions.addListener({ listener }));
      const operation = drive.operations.local.slice().pop();

      await driveServer.addDriveOperations(driveId, [operation]);
      return listener;
    },

    deletePullResponderListener: async (
      driveId: string,
      listenerId: string,
    ) => {
      let drive = await driveServer.getDrive(driveId);
      drive = reducer(drive, actions.removeListener({ listenerId }));
      const operation = drive.operations.local.slice().pop();

      await driveServer.addDriveOperations(driveId, [operation]);
      return listenerId;
    },
  };
}
