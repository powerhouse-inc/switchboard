import {
    BaseDocumentDriveServer,
    DocumentDriveServer
} from 'document-drive';

import * as DocumentModelsLibs from 'document-model-libs/document-models';
import { DocumentModel, Operation } from 'document-model/document';
import { module as DocumentModelLib } from 'document-model/document-model';

import MemoryCache from 'document-drive/cache/memory';
import RedisCache from 'document-drive/cache/redis';
import { BaseQueueManager } from 'document-drive/queue/base';
import { RedisQueueManager } from 'document-drive/queue/redis';
import { PrismaStorage } from 'document-drive/storage/prisma';
import prisma from './database';
import { redisClient } from './redis';

let driveServer: BaseDocumentDriveServer;

export async function initDocumentDriveServer() {
    redisClient
    const redisTTL = process.env.REDIS_TTL
        ? parseInt(process.env.REDIS_TTL, 10)
        : 31556952; // defaults to 1 year

    const documentModels = [
        DocumentModelLib,
        ...Object.values(DocumentModelsLibs)
    ] as DocumentModel[];

    driveServer = new DocumentDriveServer(
        documentModels,
        new PrismaStorage(prisma),
        redisClient ? new RedisCache(redisClient, redisTTL) : new MemoryCache(),
        redisClient
            ? new RedisQueueManager(1, 10, redisClient)
            : new BaseQueueManager(3, 10)
    );

    console.log('driveServer', driveServer);
}

export function getDocumentDriveServer() {
    return driveServer;
}