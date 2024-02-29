import type { Prisma } from '@prisma/client';
import {
  DocumentDriveServer,
  DriveInput,
  ListenerRevision,
  StrandUpdate,
  generateUUID,
  PullResponderTransmitter,
  InternalTransmitterUpdate,
  InternalTransmitter,
} from 'document-drive';

import { PrismaStorage } from 'document-drive/storage/prisma';
import * as DocumentModelsLibs from 'document-model-libs/document-models';
import { module as DocumentModelLib } from 'document-model/document-model';
import { Document, DocumentModel, Operation, OperationScope } from 'document-model/document';
import {
  Listener,
  ListenerFilter,
  actions,
  reducer,
} from 'document-model-libs/document-drive';
// import { init } from './listenerManager';


export function getDocumentDriveCRUD(prisma: Prisma.TransactionClient) {
  const documentModels = [
    DocumentModelLib,
    ...Object.values(DocumentModelsLibs),
  ] as DocumentModel[];

  const driveServer = new DocumentDriveServer(
    documentModels,
    new PrismaStorage(prisma as Prisma.DefaultPrismaClient),
  );

  async function mainInit() {
    await driveServer.initialize();
    const transmitter = (await driveServer.getTransmitter("core-test-2", "rwa-2")) as InternalTransmitter;
    console.log(transmitter);
    if (!transmitter) {
      await driveServer.addInternalListener(
        "core-test-2", {
        transmit: async (strands: InternalTransmitterUpdate<Document, OperationScope>[]) => {
          console.log("transmit");
          // transmitFn(strands, prisma)
        }
      },
        {
          block: false,
          filter: {
            branch: ["main"],
            documentId: ["*"],
            documentType: ["makerdao/rwa-portfolio"],
            scope: ["global"]
          },
          label: "RWA Listener",
          listenerId: "rwa-2",
        })
    } else {
      transmitter.setReceiver({
        transmit: async (strands: InternalTransmitterUpdate<Document, OperationScope>[]) => {
          console.log("transmit");
        }
      })
    }
  }

  mainInit();

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
      console.log(transmitter);
      const result = await transmitter.getStrands(since || undefined);
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
      if (!operation) {
        throw new Error('Invalid PullResponderListener');
      }
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
      if (!operation) {
        throw new Error('PullResponderListener not found');
      }
      await driveServer.addDriveOperations(driveId, [operation]);
      return listenerId;
    },

    getDocument: async (
      driveId: string,
      documentId: string,
    ) => {
      const document = await driveServer.getDocument(driveId, documentId);
      const response = {
        ...document,
        id: documentId,
        revision: document.revision.global,
        state: document.state.global,
      };
      return response;
    },
  };
}
