import { beforeAll, afterAll } from 'vitest';
import type { Server } from 'http';
import { generate } from '@genql/cli';
import fs from 'fs';
import path from 'path';
import { startServer } from '../../src/server';
import { createApp } from '../../src/app';
import { Client, createClient } from '../../generated';
import { PORT } from '../../src/env';
import { fetch } from 'undici'

// Generate types for the gql client
generate({
  schema: fs.readFileSync(path.join(__dirname, '..', '..', 'generated', 'schema.graphql')).toString(),
  output: path.join(__dirname, '..', '..', 'generated'),
}).catch(console.error);

let client: Client;
let customHeaders: Record<string, string> = {}; // cant overwrite headers on instantiated client
const defaultHeaders = {
  'Content-Type': 'application/json',
  Accept: 'application/json',
}

function getGraphqlTestContext() {
  let serverInstance: Server | null = null;
  return {
    async before() {
      const app = createApp();
      serverInstance = await startServer(app, PORT);
    },
    async after() {
      serverInstance?.close();
    },
  };
}

export function runTestApiInstance() {
  const graphqlTestContext = getGraphqlTestContext();
  beforeAll(async () => {
    await graphqlTestContext.before();
  });
  afterAll(async () => {
    await graphqlTestContext.after();
  });
}

export const getClient = (headers_?: Record<string, string>) => {
  customHeaders = headers_ || {};
  if (client) {
    return client;
  }
  return createClient({
    url: `http://0.0.0.0:${PORT}/graphql`,
    headers: () => ({...defaultHeaders, ...customHeaders}),
    fetch,
  });
};
