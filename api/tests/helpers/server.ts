import { beforeEach, afterEach } from "vitest";
import type { Server } from "http";
import { GraphQLClient } from "graphql-request";
import { parse } from "graphql";
import { startServer } from "../../src/graphql/server";
import { createApp } from "../../src/app";

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
      if (!serverAddress || typeof serverAddress === "string") {
        throw new Error("Unexpected server address format");
      }
      const { port } = serverAddress;
      baseUrl = `http://0.0.0.0:${port}`;
      const requestConfig = {
        headers: { Origin: baseUrl },
      };
      return {
        client: new GraphQLClient(`${baseUrl}/drives`, requestConfig),
        baseUrl,
        driveId: 1,
      };
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

export async function executeGraphQlQuery(data: {
  query: string;
  variables: any;
}) {
  const { query, variables } = data;
  return ctx.client.request(query, variables).catch((e) => e.response);
}

export const fetchOrThrow = async <T>(builderOutput: {
  query: string;
  variables: any;
}) => {
  const operationName = (parse(builderOutput.query).definitions[0] as any)
    .selectionSet.selections[0].name.value;
  const result = (await ctx.client.request(
    builderOutput.query,
    builderOutput.variables
  )) as any;
  if (result?.response?.errors) {
    throw new Error(result.response.errors[0].message);
  }
  return result[operationName] as T;
};
