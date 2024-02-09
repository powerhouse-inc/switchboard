import type { Prisma } from '@prisma/client';
import {
  DocumentDriveServer,
  DriveInput,
  ListenerRevision,
  StrandUpdate,
  generateUUID,
  PullResponderTransmitter,
} from 'document-drive';

import { PrismaStorage } from 'document-drive/storage/prisma';
import * as DocumentModelsLibs from 'document-model-libs/document-models';
import { module as DocumentModelLib } from 'document-model/document-model';
import { DocumentModel, Operation } from 'document-model/document';
import {
  Listener,
  ListenerFilter,
  actions,
  reducer,
} from 'document-model-libs/document-drive';


import { actions as rwaActions } from 'document-model-libs/dist/real-world-assets'


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

    getDocument: async (
      driveId: string,
      documentId: string,
    ) => {


      // const result = await driveServer.getDocument(driveId, documentId);
      const doc = DocumentModelsLibs.RealWorldAssets.utils.createDocument();

      let newDoc = DocumentModelsLibs.RealWorldAssets.reducer(doc, DocumentModelsLibs.RealWorldAssets.actions.createAccount({
        id: '1',
        reference: "frank",
        label: "Franks wallet"
      }))

      newDoc = DocumentModelsLibs.RealWorldAssets.reducer(newDoc, DocumentModelsLibs.RealWorldAssets.actions.createAccount({
        id: '2',
        reference: "wouter",
        label: "Wouters wallet"
      }))

      newDoc = DocumentModelsLibs.RealWorldAssets.reducer(newDoc, DocumentModelsLibs.RealWorldAssets.actions.setName("Franks Portfolio"));


      newDoc = DocumentModelsLibs.RealWorldAssets.reducer(newDoc, DocumentModelsLibs.RealWorldAssets.actions.createSpv({
        id: "1",
        name: "SPV 1",
      }));

      newDoc = DocumentModelsLibs.RealWorldAssets.reducer(newDoc, DocumentModelsLibs.RealWorldAssets.actions.createFixedIncomeType({
        id: "1",
        name: "Fixed Income Type #1",
      }))

      newDoc = DocumentModelsLibs.RealWorldAssets.reducer(newDoc, DocumentModelsLibs.RealWorldAssets.actions.createCashAsset({
        currency: "USD",
        id: "1",
        spvId: "1",
      }));

      newDoc = DocumentModelsLibs.RealWorldAssets.reducer(newDoc, DocumentModelsLibs.RealWorldAssets.actions.createFixedIncomeAsset({
        id: "2",
        spvId: "1",
        name: "Fixed Income Asset #1",
        fixedIncomeTypeId: "1",
        maturity: new Date().toISOString(),
      }));

      newDoc = DocumentModelsLibs.RealWorldAssets.reducer(newDoc, DocumentModelsLibs.RealWorldAssets.actions.createServiceProvider({
        accountId: "2",
        feeType: "feeType",
        id: "1",
        name: "Service Provider #1",
      }));

      newDoc = DocumentModelsLibs.RealWorldAssets.reducer(newDoc, DocumentModelsLibs.RealWorldAssets.actions.createFeesPaymentGroupTransaction({
        id: "1",
        feeTransactions: [
          {
            id: "abc",
            assetId: "2",
            amount: -10,
            accountId: "1",
            counterPartyAccountId: "2",
            entryTime: new Date().toISOString(),
            settlementTime: new Date().toISOString(),
            tradeTime: new Date().toISOString(),
            txRef: "txRef",
          }
        ]
      }))

      newDoc = DocumentModelsLibs.RealWorldAssets.reducer(newDoc, DocumentModelsLibs.RealWorldAssets.actions.createAssetPurchaseGroupTransaction({
        id: "2",
        fixedIncomeTransaction: {
          accountId: "1",
          amount: 100,
          assetId: "2",
          id: "100",
          txRef: "txRef",
          tradeTime: new Date().toISOString(),
          settlementTime: new Date().toISOString(),
          counterPartyAccountId: "2",
          entryTime: new Date().toISOString(),
        }
      }
      ));

      const response = {
        ...newDoc,
        __typename: 'RealWorldAssetsDocument',
        id: documentId,
        revision: newDoc.revision.global,
        state: newDoc.state.global,
      };

      return response;
    },
  };
}
