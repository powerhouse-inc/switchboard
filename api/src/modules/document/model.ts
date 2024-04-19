import type { Prisma, PrismaClient } from '@prisma/client';
import {
  DocumentDriveServer,
  DriveInput,
  ListenerRevision,
  StrandUpdate,
  generateUUID,
  PullResponderTransmitter,
} from 'document-drive';
import { ILogger, setLogger } from 'document-drive/logger';
import { PrismaStorage } from 'document-drive/storage/prisma';
import * as DocumentModelsLibs from 'document-model-libs/document-models';
import { module as DocumentModelLib } from 'document-model/document-model';
import { DocumentModel, Operation } from 'document-model/document';
import {
  Listener,
  ListenerFilter,
  actions,
  DocumentDriveState,
  DocumentDriveAction
} from 'document-model-libs/document-drive';
import RedisCache from 'document-drive/cache/redis';
import { RedisClientType, createClient } from 'redis';

import { init } from './listenerManager';
import { getChildLogger } from '../../logger';
import DocumentDriveError from '../../errors/DocumentDriveError';
import { getRedisClient } from '../../redis';

const logger = getChildLogger({ msgPrefix: 'Document Model' });

// creates a child logger and provides it to the document drive lib
const documentDriveLogger = getChildLogger({ msgPrefix: "Document Drive" });

// patches the log method into the info method from pino
const loggerAdapter = new Proxy<ILogger>(documentDriveLogger as unknown as ILogger, {
  get: (target, prop) =>
    prop === "log"
      ? documentDriveLogger.info
      : target[prop as keyof ILogger],
});
setLogger(loggerAdapter);

export function getDocumentDriveCRUD(prisma: Prisma.TransactionClient) {
  const documentModels = [
    DocumentModelLib,
    ...Object.values(DocumentModelsLibs),
  ] as DocumentModel[];


  let driveServer: DocumentDriveServer = new DocumentDriveServer(
    documentModels,
    new PrismaStorage(prisma as PrismaClient),
  );

  initialize();

  async function initialize() {
    try {
      await driveServer.initialize();
      await init(driveServer, prisma);
    } catch (e: any) {
      throw new DocumentDriveError({ code: 500, message: e.message ?? "Failed to initialize drive server", logging: true, context: e })
    }
  }

  async function getTransmitter(driveId: string, transmitterId: string) {
    const transmitter = await driveServer.getTransmitter(driveId, transmitterId) as PullResponderTransmitter;
    if (!transmitter) {
      throw new Error(`Transmitter ${transmitterId} not found`)
    }
    return transmitter
  }

  return {
    addDrive: async (args: DriveInput) => {
      try {
        const drive = await driveServer!.addDrive(args);
        await initialize();
        return drive;
      } catch (e) {
        logger.error(e);
        throw new Error("Couldn't add drive");
      }
    },
    deleteDrive: async (id: string) => {
      try {
        await driveServer.deleteDrive(id);
      } catch (e) {
        logger.error(e);
        throw new Error("Couldn't delete drive");
      }

      return { id };
    },
    getDrive: async (id: string) => {
      try {
        const { state } = await driveServer.getDrive(id);
        return state.global;
      } catch (e) {
        logger.error(e);
        throw new Error("Couldn't get drive");
      }
    },
    getDrives: async () => {
      try {
        const driveIds = await driveServer.getDrives()
        return driveIds;
      } catch (e) {
        logger.error(e);
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

      const result = await driveServer.addDriveAction(driveId, actions.addListener({ listener }));
      if (result.status !== "SUCCESS") {
        result.error && logger.error(result.error);
        throw new Error(`Listener couldn't be registered: ${result.error || result.status}`);
      }
      return listener;
    },

    deletePullResponderListener: async (
      driveId: string,
      listenerId: string,
    ) => {
      const result = await driveServer.addDriveAction(driveId, actions.removeListener({ listenerId }));
      if (result.status !== "SUCCESS") {
        result.error && logger.error(result.error);
        throw new Error(`Listener couldn't be deleted: ${result.error || result.status}`);
      }

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
        operations: document.operations.global,
      };
      return response;
    },

    getDocuments: async (driveId: string) => {
      const documents = await driveServer.getDocuments(driveId);
      return documents;
    }
  }
}
