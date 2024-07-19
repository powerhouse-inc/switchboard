import { test, expect } from 'vitest';
import builder from 'gql-query-builder';
import { CoreUnit } from '@prisma/client';
import { cleanDatabase as cleanDatabaseBeforeAfterEachTest } from './helpers/database';
import { executeGraphQlQuery } from './helpers/server';
import prisma from '../src/database';
import { gql } from 'graphql-request';
import { initRedis } from '../src/redis';
import { RealWorldAssetsDocument } from "document-model-libs/real-world-assets";
import * as DocumentModelsLibs from 'document-model-libs/document-models';
import { BaseAction, DocumentModel } from 'document-model/document';
import {
  DocumentModelAction,
  DocumentModelDocument,
  module as DocumentModelLib,
  actions,
  reducer
} from 'document-model/document-model';

cleanDatabaseBeforeAfterEachTest();


test('RWA: get by document', async () => {
  const documentModels = [
    DocumentModelLib,
    ...Object.values(DocumentModelsLibs)
  ] as DocumentModel[];

  let rwa = DocumentModelsLibs.RealWorldAssets.utils.createDocument() as RealWorldAssetsDocument;
  const redisClient = await initRedis();
  redisClient.hSet('1', '1', JSON.stringify({ id: 1, name: 'test' }));

  const variables = {}
  const response = await executeGraphQlQuery({ query, variables }) as any;
  expect(response.coreUnit.id).toBe(created.id);
});

