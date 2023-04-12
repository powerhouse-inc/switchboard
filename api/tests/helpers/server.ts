import { beforeEach, afterEach, vi } from 'vitest';
import type { Server } from 'http';
import { startServer } from '../../src/graphql/server';
import { createApp } from '../../src/app';
import { setClient, context, TestContext } from './testContext';

function getGraphqlTestContext() {
  let serverInstance: Server | null = null;
  let baseUrl: string | null = null;
  const headers: Record<string, string> = {};
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
      setClient(baseUrl, headers);
    },
    async after() {
      serverInstance?.close();
      baseUrl = null;
    },
  };
}

function createTestContext(): TestContext {
  const graphqlTestContext = getGraphqlTestContext();
  beforeEach(async () => {
    vi.clearAllMocks();
    await graphqlTestContext.before();
  });
  afterEach(async () => {
    vi.clearAllMocks();
    await graphqlTestContext.after();
  });
  return context;
}

export const ctx = createTestContext();
