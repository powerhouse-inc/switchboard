import { beforeEach, afterEach } from 'vitest';
import type { Server } from 'http';
import { GraphQLClient } from 'graphql-request';
import { startServer } from '../../src/graphql/server';
import { createApp } from '../../src/app';

interface TestContext {
  client: GraphQLClient;
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
      if (!serverAddress || typeof serverAddress === 'string') {
        throw new Error('Unexpected server address format');
      }
      const { port } = serverAddress;
      baseUrl = `http://0.0.0.0:${port}`;
      return { client: new GraphQLClient(`${baseUrl}/graphql`), baseUrl };
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
export async function executeGraphQlQuery(data: { query: string, variables: any }) {
  const { query, variables } = data;
  return ctx.client.request(query, variables).catch((e) => e.response);
}
