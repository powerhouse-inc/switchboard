import { cleanDatabase } from "./helpers/database";
import { restoreEnvAfterEach } from "./helpers/env";
import {
  acknowledge,
  addDrive,
  addFile,
  addPullResponderListener,
  pullStrands,
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
    const pushUpdatesResponse = await addFile();
    expect(pushUpdatesResponse.length).toBe(1);

    // add listener
    const pullResponderResponse = await addPullResponderListener();
    expect(pullResponderResponse.listenerId).not.toBeNull();

    // pullStrands
    const pull1StrandsResponse = await pullStrands(
      pullResponderResponse.listenerId
    );

    // acknowledge
    const ack1Response = await acknowledge(
      pullResponderResponse.listenerId,
      []
    );
    expect(ack1Response).toBe(true);

    // push strands - should update budget statement

    // pull twice - should be same result
    // acknowlege - should be boolean
    // pull again - should be empty resultset
  });
});
