import { parse } from 'graphql';
import { GraphQLClient } from 'graphql-request';
import type { Server } from 'http';
import { afterEach, beforeEach } from 'vitest';
import { createApp } from '../../src/app';
import { startServer } from '../../src/graphql/server';

interface TestContext {
  client: GraphQLClient;
  driveClient: GraphQLClient;
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
      const requestConfig = {
        headers: { Origin: baseUrl }
      };
      return {
        client: new GraphQLClient(`${baseUrl}/drives`, requestConfig),
        driveClient: new GraphQLClient(`${baseUrl}/d/1`, requestConfig),
        baseUrl,
        driveId: 1
      };
    },
    async after() {
      serverInstance?.close();
      baseUrl = null;
    }
  };
}

function createTestContext(): TestContext {
  const context = {} as TestContext;
  const graphqlTestContext = getGraphqlTestContext();
  beforeEach(async () => {
    const { client, baseUrl, driveClient } = await graphqlTestContext.before();
    context.client = client;
    context.driveClient = driveClient;
    context.baseUrl = baseUrl;
  });
  afterEach(async () => {
    await graphqlTestContext.after();
  });
  return context;
}

export const ctx = createTestContext();

export async function executeGraphQlQuery(data: {
  query: string;
  variables: any;
}) {
  const { query, variables } = data;
  return ctx.client.request(query, variables).catch(e => e.response);
}

export async function executeDriveGraphQlQuery(data: {
  query: string;
  variables: any;
}) {
  const { query, variables } = data;
  return ctx.driveClient.request(query, variables).catch(e => e.response);
}

export const fetchOrThrow = async <T>(
  builderOutput: {
    query: string;
    variables: any;
  },
  drive = false
) => {
  const operationName = (parse(builderOutput.query).definitions[0] as any)
    .selectionSet.selections[0].name.value;

  let result;
  if (drive) {
    result = (await ctx.driveClient.request(
      builderOutput.query,
      builderOutput.variables
    )) as any;
  } else {
    result = (await ctx.client.request(
      builderOutput.query,
      builderOutput.variables
    )) as any;
  }

  if (result?.response?.errors) {
    throw new Error(result.response.errors[0].message);
  }
  return result[operationName] as T;
};
