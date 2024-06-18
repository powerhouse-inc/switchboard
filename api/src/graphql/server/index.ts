import type express from 'express';
import { ApolloServerPlugin, ApolloServer } from '@apollo/server';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';
import { expressMiddleware } from '@apollo/server/express4';
import cookierParser from 'cookie-parser';
import cors from 'cors';
import type { WebSocketServer } from 'ws';
import { useServer } from 'graphql-ws/lib/use/ws';
import type { Server } from 'http';
import { schemaWithMiddleware as indexSchema } from './index/schema';
import { schemaWithMiddleware as driveSchema } from './drive/schema';
import {
  Context,
  Context as IndexContext,
  createContext as createIndexContext,
} from './index/context';
import {
  Context as DriveContext,
  createContextWebsocket,
  createContext as createDriveContext,
} from './drive/context';
import { getExtendedPrisma } from '../../importedModules';
import NotFoundError from '../../errors/NotFoundError';

function loggerPlugin(): ApolloServerPlugin<Context> {
  return {
    async requestDidStart() {
      return {
        async didEncounterErrors(c) {
          c.errors?.forEach((e) => {
            c.contextValue.apolloLogger.error({ error: e }, e.message);
          });
        },
      };
    },
  };
}

const createApolloIndexServer = (
  httpServer: Server,
  plugins: ApolloServerPlugin<IndexContext>[] = [],
): ApolloServer<IndexContext> => new ApolloServer<IndexContext>({
  schema: indexSchema,
  introspection: true,
  plugins: [
    loggerPlugin(),
    ApolloServerPluginDrainHttpServer({ httpServer }),
    ...plugins,
  ],
});

const createApolloDriveServer = (
  wsServer: WebSocketServer,
  plugins: ApolloServerPlugin<DriveContext>[] = [],
): ApolloServer<DriveContext> => new ApolloServer<DriveContext>({
  schema: driveSchema,
  introspection: true,
  plugins: [loggerPlugin(), ...plugins],
});

export const addGraphqlRoutes = async (
  router: express.Router,
  httpServer: Server,
  wsServer: WebSocketServer,
) => {
  // add ws handlers for drive schema
  const driveWsServer = useServer(
    {
      schema: driveSchema,
      context: (ctx) => createContextWebsocket(ctx.extra.request),
    },
    wsServer,
  );

  const apolloIndex = createApolloIndexServer(httpServer);
  const apolloDrive = createApolloDriveServer(wsServer, [
    {
      async serverWillStart() {
        return {
          async drainServer() {
            await driveWsServer.dispose();
          },
        };
      },
    },
  ]);

  await apolloIndex.start();
  await apolloDrive.start();

  router.use(
    '/drives',
    cors<cors.CorsRequest>(),
    cookierParser(undefined, { decode: (value: string) => value }),
    expressMiddleware(apolloIndex, {
      context: async (params) => createIndexContext(params),
    }),
  );

  router.use(
    '/d/:driveId',
    cors<cors.CorsRequest>(),
    cookierParser(undefined, { decode: (value: string) => value }),
    async (req, res, next) => {
      const prisma = getExtendedPrisma();
      const { driveId } = req.params;

      if (!driveId) {
        throw new Error('driveId required');
      }

      try {
        await prisma.document.getDrive(driveId);
      } catch (e) {
        throw new NotFoundError({ message: (e as Error).message });
      }
      next();
    },
    expressMiddleware(apolloDrive, {
      context: async (params) => createDriveContext(params),
    }),
  );
};

export { Context };
