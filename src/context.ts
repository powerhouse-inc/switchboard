import { PrismaClient } from '@prisma/client';
import type express from 'express';
import { PubSub } from 'graphql-subscriptions';
import type { ApolloServer } from 'apollo-server-express';
import type { Disposable } from 'graphql-ws';
import type { Server } from 'http';
import { WebSocketServer } from 'ws';
import { useServer } from 'graphql-ws/lib/use/ws';
import { getPrisma } from './database';
import { schemaWithMiddleware } from './schema';
import { getUserId } from './utils/auth';
import { JWT_SECRET } from './env';

const prisma = getPrisma();
const pubsub = new PubSub();
const { NODE_ENV } = process.env;

export interface Context {
  request: { req: express.Request };
  pubsub: PubSub;
  prisma: PrismaClient;
  userId: string | null;
}

type CreateContextParams = {
  req: express.Request;
  res: express.Response;
  connection?: unknown;
};

export function createContext(params: CreateContextParams): Context {
  const { req, connection } = params;
  const authorization = !req || !req.headers
    ? (connection as any)?.context?.connectionParams?.Authorization // for subscriptions.
    : req.get('Authorization'); // for queries & mutations.

  if (!JWT_SECRET) {
    throw new Error('Missing JWT_SECRET environment variable');
  }
  return {
    request: params,
    pubsub,
    prisma,
    userId: getUserId(authorization),
  };
}

export const runSubscriptionServer = (
  httpServer: Server,
  apollo: ApolloServer,
): Disposable => {
  const subscriptionServer = new WebSocketServer({
    server: httpServer,
    path: apollo.graphqlPath,
  });

  const serverCleanup = useServer(
    {
      schema: schemaWithMiddleware,
      context: async (ctx) => {
        process.stdout.write('Connected to websocket\n');

        // Return connection parameters for context building.
        return {
          connectionParams: ctx.connectionParams,
          prisma,
          pubsub,
          appSecret: JWT_SECRET,
          userId: getUserId(
            // @ts-ignore
            ctx.connectionParams?.Authorization
              || ctx.connectionParams?.authorization,
          ),
        };
      },
    },
    subscriptionServer,
  );

  if (NODE_ENV === 'production') {
    ['SIGINT', 'SIGTERM'].forEach((signal) => {
      process.on(signal, () => subscriptionServer.close());
    });
  }

  return serverCleanup;
};
