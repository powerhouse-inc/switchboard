import type { Server } from 'http';
import { createServer as createHttpServer } from 'http';
import type express from 'express';
import { ApolloServerPlugin, ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import bodyParser from 'body-parser';
import cookierParser from 'cookie-parser';
import cors from 'cors';
import { CORS_ORIGINS, PORT } from '../../env';
import { schemaWithMiddleware as indexSchema } from './index/schema';
import { schemaWithMiddleware as driveSchema } from './drive/schema';
import { Context as IndexContext, createContext as createIndexContext } from './index/context';
import { Context as DriveContext, createContext as createDriveContext } from './drive/context';
import { getChildLogger } from '../../logger';

const logger = getChildLogger({ msgPrefix: 'SERVER' });

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

const createApolloIndexServer = (): ApolloServer<IndexContext> => new ApolloServer<IndexContext>({
  schema: indexSchema,
  introspection: true,
  plugins: [loggerPlugin()],
});

const createApolloDriveServer = (): ApolloServer<DriveContext> => new ApolloServer<DriveContext>({
  schema: driveSchema,
  introspection: true,
  plugins: [loggerPlugin()],
});

export const startServer = async (
  app: express.Application,
): Promise<Server> => {
  logger.debug('Starting server');
  const httpServer = createHttpServer(app);
  const apolloIndex = createApolloIndexServer();
  const apolloDrive = createApolloDriveServer();

  await apolloIndex.start();
  await apolloDrive.start();

  app.use(
    '/drives',
    cors<cors.CorsRequest>({
      origin: CORS_ORIGINS,
    }),

    cookierParser(undefined, { decode: (value: string) => value }),
    bodyParser.json(),
    expressMiddleware(apolloIndex, {
      context: async (params) => createIndexContext(params),
    }),
  );

  app.use(
    '/d/:driveId',
    cors<cors.CorsRequest>({
      origin: CORS_ORIGINS,
    }),

    cookierParser(undefined, { decode: (value: string) => value }),
    bodyParser.json(),
    expressMiddleware(apolloDrive, {
      context: async (params) => createDriveContext(params),
    }),
  );

  return httpServer.listen({ port: PORT }, () => {
    logger.info(`Running on ${PORT}`);
  });
};
