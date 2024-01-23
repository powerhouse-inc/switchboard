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
    const pullStrandsResponse = await pullStrands(
      pullResponderResponse.listenerId
    );

    // acknowledge
    const ack1Response = await acknowledge(
      pullResponderResponse.listenerId,
      []
    );
    console.log(ack1Response);

    // pull again

    // push strands

    // pull again

    // acknowlege

    // pull again
  });
  // it("adds a file", async () => {
  //   // const addDriveResponse = await addDrive();
  //   // expect(pushUpdatesResponse.length).toBe(1);
  // });
  it.todo("adds operations");
  it.todo("registers a listener as pull responder");
  it.todo("syncs the latest strands to listener");
  it.todo("listener acknowledges strands");
  it.todo("listener pushes new operations");
});
