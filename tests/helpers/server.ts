import { beforeEach, afterEach } from 'vitest';
import getPort from 'get-port';
import type { Server } from 'http';
import { GraphQLClient } from 'graphql-request';
import { startServer } from '../../src/index';
import { createApp } from '../../src/app';

interface TestContext {
  client: GraphQLClient;
}

export const ctx = createTestContext();

export async function executeGraphQlQuery(query: string) {
  return ctx.client.request(query).catch((e) => e.response);
}

function createTestContext(): TestContext {
  const context = {} as TestContext;
  const graphqlTestContext = getGraphqlTestContext();
  beforeEach(async () => {
    const client = await graphqlTestContext.before();
    context.client = client;
  });
  afterEach(async () => {
    await graphqlTestContext.after();
  });
  return context;
}

function getGraphqlTestContext() {
  let serverInstance: Server | null = null;
  return {
    async before() {
      const port = await getPort({ port: 3000 }); // 4
      const app = createApp();
      serverInstance = await startServer(app, port);
      return new GraphQLClient(`http://localhost:${port}/graphql`); // 6
    },
    async after() {
      serverInstance?.close();
    },
  };
}
