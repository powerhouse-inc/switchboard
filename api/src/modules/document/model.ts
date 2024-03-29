import type { Prisma, PrismaClient } from '@prisma/client';
import {
  DocumentDriveServer,
  DriveInput,
  ListenerRevision,
  StrandUpdate,
  generateUUID,
  PullResponderTransmitter,
  IReceiver,
  InternalTransmitter,


} from 'document-drive';

import { PrismaStorage } from 'document-drive/storage/prisma';
import * as DocumentModelsLibs from 'document-model-libs/document-models';
import { module as DocumentModelLib } from 'document-model/document-model';
import { DocumentModel, Operation, State } from 'document-model/document';
import {
  Listener,
  ListenerFilter,
  actions,
  reducer,
  DocumentDriveState,
  DocumentDriveAction
} from 'document-model-libs/document-drive';


import { init } from './listenerManager';
import { getChildLogger } from '../../logger';

const logger = getChildLogger({ msgPrefix: 'Document Model' });

export function getDocumentDriveCRUD(prisma: Prisma.TransactionClient) {
  const documentModels = [
    DocumentModelLib,
    ...Object.values(DocumentModelsLibs),
  ] as DocumentModel[];

  let transmitters: Record<string, Record<string, PullResponderTransmitter>> = {};
  let drives: Record<string, DocumentDriveState> = {};

  const driveServer = new DocumentDriveServer(
    documentModels,
    new PrismaStorage(prisma as PrismaClient),
  );

  async function initialize() {
    await driveServer.initialize();
    await init(driveServer, prisma);
  }

  function clearDriveCache() {
    drives = {};
  }

  function clearTransmitterCache() {
    transmitters = {};
  }

  async function getTransmitter(driveId: string, transmitterId: string) {
    if (!transmitters[driveId]) {
      transmitters[driveId] = {};
    }

    let transmitter = transmitters[driveId][transmitterId];
    if (!transmitter) {
      transmitter = await driveServer.getTransmitter(driveId, transmitterId) as PullResponderTransmitter;
      if (!transmitter) {
        throw new Error(`Transmitter ${transmitterId} not found`)
      }
      transmitters[driveId][transmitterId] = transmitter;
    }

    return transmitter
  }

  initialize();

  setInterval(() => {
    clearDriveCache();
    clearTransmitterCache();
  }, 1000 * 60 * 15);

  return {
    addDrive: async (args: DriveInput) => {
      try {
        await driveServer.addDrive(args);
        await initialize();
        clearDriveCache();
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
        clearDriveCache();
      } catch (e) {
        throw new Error("Couldn't delete drive");
      }

      return { id };
    },
    getDrive: async (id: string) => {
      try {
        let drive = drives[id];
        if (!drive) {
          const { state } = await driveServer.getDrive(id);
          drives[id] = state.global;
          return state.global;
        } else {
          return drive;
        }


      } catch (e) {
        throw new Error("Couldn't get drive");
      }
    },
    getDrives: async () => {
      try {
        let driveIds = Object.keys(drives);
        if (driveIds.length > 0) {
          return driveIds;
        }
        driveIds = await driveServer.getDrives()
        driveIds.forEach((driveId) => {
          transmitters[driveId] = {};
        })

        return driveIds;
      } catch (e) {
        throw new Error("Couldn't get drives");
      }
    },

    pushUpdates: async (
      driveId: string,
      operations: Operation<DocumentDriveAction>[],
      documentId?: string,
    ) => {
      if (!documentId) {
        logger.info('adding drive operations')
        const result = await driveServer.addDriveOperations(
          driveId,
          operations,
        );

        return result;
      }
      logger.info('adding operations to document')
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

      const transmitter = await getTransmitter(driveId, listenerId);
      if (transmitter.getStrands) {
        const result = await transmitter.getStrands(since || undefined);
        return result;
      }

      return []
    },

    processAcknowledge: async (
      driveId: string,
      listenerId: string,
      revisions: ListenerRevision[],
    ) => {
      const transmitter = await getTransmitter(driveId, listenerId);
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
        throw new Error("Operation couldnt be applied")
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
        throw new Error("Operation couldnt be applied")
      }

      await driveServer.addDriveOperations(driveId, [operation]);
      delete transmitters[driveId][listenerId];
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
  }
}
