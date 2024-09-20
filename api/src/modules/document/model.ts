import type { Prisma, PrismaClient } from '@prisma/client';
import {
  DocumentDriveServer,
  DriveInput,
  generateUUID,
  ListenerRevision,
  PullResponderTransmitter,
  StrandUpdate
} from 'document-drive';
import { ILogger, setLogger } from 'document-drive/logger';
import { PrismaStorage } from 'document-drive/storage/prisma';
import { DocumentGraphQLResult } from 'document-drive/utils/graphql';
import {
  actions,
  DocumentDriveAction,
  Listener,
  ListenerFilter
} from 'document-model-libs/document-drive';
import * as DocumentModelsLibs from 'document-model-libs/document-models';
import { Document, DocumentModel, Operation } from 'document-model/document';
import { module as DocumentModelLib } from 'document-model/document-model';

// import * as sow from 'document-model-libs/scope-of-work';
import MemoryCache from 'document-drive/cache/memory';
import RedisCache from 'document-drive/cache/redis';
import { BaseQueueManager } from 'document-drive/queue/base';
import { RedisQueueManager } from 'document-drive/queue/redis';

import { RealWorldAssetsDocument } from 'document-model-libs/real-world-assets';
import DocumentDriveError from '../../errors/DocumentDriveError';
import { getChildLogger } from '../../logger';
import { initRedis } from '../../redis';
import { migrateOperationContext } from '../document-drive/utils';
import { buildRWADocument } from '../real-world-assets/utils';
import { init } from './listenerManager';

const logger = getChildLogger({ msgPrefix: 'Document Model' });

// creates a child logger and provides it to the document drive lib
const documentDriveLogger = getChildLogger({ msgPrefix: 'Document Drive' });

// patches the log method into the info method from pino
const loggerAdapter = new Proxy<ILogger>(
  documentDriveLogger as unknown as ILogger,
  {
    get: (target, prop) =>
      prop === 'log' ? documentDriveLogger.info : target[prop as keyof ILogger]
  }
);
setLogger(loggerAdapter);

const redisClient = process.env.REDIS_TLS_URL ? await initRedis() : undefined;
const redisTTL = process.env.REDIS_TTL
  ? parseInt(process.env.REDIS_TTL, 10)
  : 31556952; // defaults to 1 year

export function getDocumentDriveCRUD(prisma: Prisma.TransactionClient) {
  const documentModels = [
    DocumentModelLib,
    ...Object.values(DocumentModelsLibs)
  ] as DocumentModel[];

  const driveServer = new DocumentDriveServer(
    documentModels,
    new PrismaStorage(prisma as PrismaClient),
    redisClient ? new RedisCache(redisClient, redisTTL) : new MemoryCache(),
    redisClient
      ? new RedisQueueManager(1, 10, redisClient)
      : new BaseQueueManager(3, 10)
  );

  initialize();
  async function initialize() {
    try {
      await driveServer.initialize();
      await init(driveServer, prisma);
    } catch (e: any) {
      throw new DocumentDriveError({
        code: 500,
        message: e.message ?? 'Failed to initialize drive server',
        logging: true,
        context: e
      });
    }
  }

  async function getTransmitter(driveId: string, transmitterId: string) {
    const transmitter = (await driveServer.getTransmitter(
      driveId,
      transmitterId
    )) as PullResponderTransmitter;
    if (!transmitter) {
      throw new Error(`Transmitter ${transmitterId} not found`);
    }
    return transmitter;
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
        return state;
      } catch (e) {
        logger.error(e);
        throw new Error('Drive not found');
      }
    },
    getDriveBySlug: async (slug: string) => {
      try {
        const { state } = await driveServer.getDriveBySlug(slug);
        return state.global;
      } catch (e) {
        logger.error(e);
        throw new Error('Drive not found');
      }
    },
    getDrives: async () => {
      try {
        const driveIds = await driveServer.getDrives();
        return driveIds;
      } catch (e) {
        logger.error(e);
        throw new Error("Couldn't get drives");
      }
    },

    pushUpdates: async (
      driveId: string,
      operations: Operation<DocumentDriveAction>[],
      documentId?: string
    ) => {
      if (!documentId) {
        logger.info('adding drive operations');
        const result = await driveServer.queueDriveOperations(
          driveId,
          operations
        );

        return result;
      }
      logger.info('adding operations to document');
      const result = await driveServer.queueOperations(
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
    ): Promise<StrandUpdate[]> => {
      const transmitter = await getTransmitter(driveId, listenerId);
      if (transmitter.getStrands) {
        const result = await transmitter.getStrands({ since });
        return result;
      }

      return [];
    },

    processAcknowledge: async (
      driveId: string,
      listenerId: string,
      revisions: ListenerRevision[]
    ) => {
      const transmitter = await getTransmitter(driveId, listenerId);
      const result = await transmitter.processAcknowledge(
        driveId,
        listenerId,
        revisions
      );

      return result;
    },

    registerPullResponderListener: async (
      driveId: string,
      filter: ListenerFilter
    ): Promise<Listener> => {
      const uuid = generateUUID();
      const listener: Listener = {
        block: false,
        callInfo: {
          data: '',
          name: 'PullResponder',
          transmitterType: 'PullResponder'
        },
        filter: {
          branch: filter.branch ?? [],
          documentId: filter.documentId ?? [],
          documentType: filter.documentType ?? [],
          scope: filter.scope ?? []
        },
        label: `Pullresponder #${uuid}`,
        listenerId: uuid,
        system: false
      };

      const result = await driveServer.queueDriveAction(
        driveId,
        actions.addListener({ listener })
      );
      if (result.status !== 'SUCCESS') {
        result.error && logger.error(result.error);
        throw new Error(
          `Listener couldn't be registered: ${result.error || result.status}`
        );
      }

      return listener;
    },

    deletePullResponderListener: async (
      driveId: string,
      listenerId: string
    ) => {
      const result = await driveServer.queueDriveAction(
        driveId,
        actions.removeListener({ listenerId })
      );
      if (result.status !== 'SUCCESS') {
        result.error && logger.error(result.error);
        throw new Error(
          `Listener couldn't be deleted: ${result.error || result.status}`
        );
      }

      return listenerId;
    },

    getDocument: async (
      driveId: string,
      documentId: string
    ): Promise<DocumentGraphQLResult<Document>> => {
      let document = await (driveId !== documentId
        ? driveServer.getDocument(driveId, documentId)
        : driveServer.getDrive(documentId));
      if (document.documentType === 'makerdao/rwa-portfolio') {
        document = buildRWADocument(document as RealWorldAssetsDocument);
      }

      const response = {
        ...document,
        id: documentId,
        revision: document.revision.global,
        state: document.state.global,
        operations: document.operations.global.map(op => ({
          ...op,
          inputText:
            typeof op.input === 'string' ? op.input : JSON.stringify(op.input),
          context: migrateOperationContext(op.context)
        })),
        initialState: document.initialState.state.global
      };
      return response;
    },

    getDocuments: async (driveId: string) => {
      const documents = await driveServer.getDocuments(driveId);
      return documents;
    },

    setDriveIcon: async (driveId: string, icon: string) =>
      driveServer.queueDriveAction(driveId, actions.setDriveIcon({ icon })),
    setDriveName: async (driveId: string, name: string) =>
      driveServer.queueDriveAction(driveId, actions.setDriveName({ name }))
    // closeScopeOfWorkIssue: async (githubId: number) => {
    // const dbEntry = await prisma.scopeOfWorkDeliverable.findFirst({
    //     where: {
    //         githubId: githubId
    //     }
    // })
    // if (!dbEntry) {
    //     throw new Error("Deliverable not found");
    // }
    // const { driveId, documentId, id } = dbEntry;
    // const sowDocument = await driveServer.getDocument(driveId, documentId) as ScopeOfWorkDocument;
    // if (!sowDocument) {
    //     throw new Error("Document not found");
    // }
    // const result = await driveServer.addAction(driveId, documentId, sow.actions.updateDeliverableStatus({
    //     id,
    //     status: "DELIVERED"
    // }))
    // return result;
    //   }
  };
}
