import { beforeAll, afterAll, beforeEach } from 'vitest';
import type { Server } from 'http';
import { GraphQLClient } from 'graphql-request';
import { startServer } from '../../src/server';
import { createApp } from '../../src/app';
import { PORT } from '../../src/env';

interface TestContext {
  client: GraphQLClient;
}

function getGraphqlTestContext() {
  let serverInstance: Server | null = null;
  return {
    async before() {
      const app = createApp();
      serverInstance = await startServer(app, PORT);
      return new GraphQLClient(`http://localhost:${PORT}/graphql`);
    },
    async after() {
      serverInstance?.close();
    },
  };
}

function createTestContext(): TestContext {
  const context = {} as TestContext;
  const graphqlTestContext = getGraphqlTestContext();
  beforeAll(async () => {
    const client = await graphqlTestContext.before();
    context.client = client;
  });
  afterAll(async () => {
    await graphqlTestContext.after();
  });
  beforeEach(async () => {
    context.client?.setHeader('Authorization', '');
  });
  return context;
}

export const ctx = createTestContext();
export async function executeGraphQlQuery(query: string) {
  return ctx.client.request(query).catch((e) => e.response);
}
