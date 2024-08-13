import { ListenerRevision, UpdateStatus } from 'document-drive';
import { beforeEach, describe, expect, it } from 'vitest';
import { cleanDatabase } from './helpers/database';
import { restoreEnvAfterEach } from './helpers/env';
import {
  acknowledge,
  addBudgetStatement,
  addDrive,
  addLineItem,
  addPullResponderListener,
  pullStrands
} from './helpers/gql';

describe('Document Drive Server', () => {
  beforeEach(async () => {
    await cleanDatabase();
    await restoreEnvAfterEach();
  });

  it('it syncs with listener', async () => {
    // add drive without listener
    const addDriveResponse = await addDrive();
    expect(addDriveResponse.global.id).toBe('1');

    // add file
    const pushUpdatesResponse = await addBudgetStatement();
    expect(pushUpdatesResponse.length).toBe(1);

    // add listener
    const pullResponderResponse = await addPullResponderListener();
    expect(pullResponderResponse.listenerId).not.toBeNull();

    // pullStrands
    const pull1StrandsResponse = await pullStrands(
      pullResponderResponse.listenerId
    );

    expect(
      pull1StrandsResponse.sync.strands.find(e => e.documentId != '1')!
        .operations.length
    ).toBe(1);
    expect(
      pull1StrandsResponse.sync.strands.find(e => e.documentId == '1')!
        .operations.length
    ).toBe(0);

    // acknowledge
    const ack1Response = await acknowledge(
      pullResponderResponse.listenerId,
      []
    );
    expect(ack1Response).toBe(true);

    // push strands - should update budget statement
    const addLineItemResponse1 = await addLineItem(
      '0xdef1c0ded9bec7f1a1670819833240f027b25eff',
      0
    );
    const addLineItemResponse2 = await addLineItem(
      '0xdef1c0ded9bec7f1a1670819833240f027b25eff',
      1
    );

    expect(addLineItemResponse2).toStrictEqual([
      {
        branch: 'main',
        documentId: '1',
        driveId: '1',
        revision: 1,
        scope: 'global',
        status: 'SUCCESS'
      }
    ]);

    // pull twice - should be same result
    const pull2StrandsResponse = await pullStrands(
      pullResponderResponse.listenerId
    );

    expect(
      pull2StrandsResponse.sync.strands.find(e => e.documentId === '1')!
        .operations.length
    ).toBe(2);
    const pull3StrandsResponse = await pullStrands(
      pullResponderResponse.listenerId
    );
    expect(
      pull3StrandsResponse.sync.strands.find(e => e.documentId === '1')!
        .operations.length
    ).toBe(2);

    // acknowlege - should be boolean
    const listenerRevisions: ListenerRevision[] =
      pull3StrandsResponse.sync.strands.map<ListenerRevision>(e => {
        return {
          driveId: e.driveId,
          documentId: e.documentId,
          scope: e.scope,
          branch: e.branch,
          status: 'SUCCESS' as UpdateStatus,
          revision: e.operations[e.operations.length - 1].index
        };
      });

    const ack2Response = await acknowledge(
      pullResponderResponse.listenerId,
      listenerRevisions
    );
    expect(ack2Response).toBe(true);

    // pull again - should be empty resultset
    const pull4StrandsResponse = await pullStrands(
      pullResponderResponse.listenerId
    );

    // should be empty
    expect(
      pull4StrandsResponse.sync.strands.filter(e => e.documentId !== '1').length
    ).toBe(0);
    expect(
      pull4StrandsResponse.sync.strands.filter(e => e.documentId === '1').length
    ).toBe(0);
  });
});
