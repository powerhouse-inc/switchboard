import type { TypedDocumentNode } from "@graphql-typed-document-node/core";
import { beforeEach, afterEach } from "vitest";
import type { Server } from "http";
import { GraphQLClient } from "graphql-request";
import { startServer } from "../../src/graphql/server";
import { createApp } from "../../src/app";
import {createClient, Client} from '../../generated'


interface TestContext {
  client: Client;
  baseUrl: string;
}

function getGraphqlTestContext() {
  let serverInstance: Server | null = null;
  let baseUrl: string | null = null;
  return {
    async before() {
      const app = createApp();
      serverInstance = await startServer(app);
      const serverAddress = serverInstance.address();
      if (!serverAddress || typeof serverAddress === "string") {
        throw new Error("Unexpected server address format");
      }
      const { port } = serverAddress;
      baseUrl = `http://0.0.0.0:${port}`;
      const client = createClient(
        {
          url: baseUrl
        }
      )
      return { client, baseUrl };
    },
    async after() {
      serverInstance?.close();
      baseUrl = null;
    },
  };
}

function createTestContext(): TestContext {
  const context = {} as TestContext;
  const graphqlTestContext = getGraphqlTestContext();
  beforeEach(async () => {
    const { client, baseUrl } = await graphqlTestContext.before();
    context.client = client;
    context.baseUrl = baseUrl;
  });
  afterEach(async () => {
    await graphqlTestContext.after();
  });
  return context;
}

export const ctx = createTestContext();

