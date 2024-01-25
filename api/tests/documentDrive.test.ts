import { ListenerRevision, UpdateStatus } from "document-drive";
import { cleanDatabase } from "./helpers/database";
import { restoreEnvAfterEach } from "./helpers/env";
import {
  acknowledge,
  addDrive,
  addBudgetStatement,
  addPullResponderListener,
  pullStrands,
  addLineItem,
} from "./helpers/gql";
import { expect, describe, it, afterAll } from "vitest";

describe.only("Document Drive Server", () => {
  afterAll(async () => {
    await cleanDatabase();
    await restoreEnvAfterEach();
  });

  it("it syncs with listener", async () => {
    // add drive without listener
    const addDriveResponse = await addDrive();
    expect(addDriveResponse.global.id).not.toBeNull();

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
    expect(pull1StrandsResponse.length).toBe(0);

    // acknowledge
    const ack1Response = await acknowledge(
      pullResponderResponse.listenerId,
      []
    );
    expect(ack1Response).toBe(true);

    // push strands - should update budget statement
    const addLineItemResponse1 = await addLineItem(
      "0xdef1c0ded9bec7f1a1670819833240f027b25eff"
    );
    const addLineItemResponse2 = await addLineItem(
      "0xdef1c0ded9bec7f1a1670819833240f027b25eff"
    );

    expect(addLineItemResponse2.length).toBe(1);

    // pull twice - should be same result
    const pull2StrandsResponse = await pullStrands(
      pullResponderResponse.listenerId
    );
    expect(pull2StrandsResponse.length).toBe(1);
    const pull3StrandsResponse = await pullStrands(
      pullResponderResponse.listenerId
    );
    expect(pull3StrandsResponse.length).toBe(1);

    // acknowlege - should be boolean
    const ack2Response = await acknowledge(
      pullResponderResponse.listenerId,
      pull3StrandsResponse.map<ListenerRevision>((e) => {
        return {
          driveId: e.driveId,
          documentId: e.documentId,
          scope: e.scope,
          branch: e.branch,
          status: "SUCCESS" as UpdateStatus,
          revision: e.operations[e.operations.length - 1].revision,
        };
      })
    );
    expect(ack2Response).toBe(true);

    // pull again - should be empty resultset
    const pull4StrandsResponse = await pullStrands(
      pullResponderResponse.listenerId
    );
    expect(pull4StrandsResponse.length).toBe(0);
  });
});
