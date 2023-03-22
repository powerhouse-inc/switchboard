import { beforeEach, afterEach } from 'vitest';
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
      serverInstance = await startServer(app);
      return new GraphQLClient(`http://0.0.0.0:${PORT}/graphql`);
    },
    async after() {
      serverInstance?.close();
    },
  };
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

export const ctx = createTestContext();
export async function executeGraphQlQuery(data: { query: string, variables: any }) {
  const { query, variables } = data;
  return ctx.client.request(query, variables).catch((e) => e.response);
}
