import type { Server } from 'http';
import { createServer as createHttpServer } from 'http';
import type express from 'express';
import { ApolloServerPlugin, ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import bodyParser from 'body-parser';
import cookierParser from 'cookie-parser';
import cors from 'cors';
import { PORT } from '../../env';
import { schemaWithMiddleware as indexSchema } from './index/schema';
import { schemaWithMiddleware as driveSchema } from './drive/schema';
import { Context, Context as IndexContext, createContext as createIndexContext } from './index/context';
import { Context as DriveContext, createContext as createDriveContext } from './drive/context';
import { getChildLogger } from '../../logger';
import "express-async-errors";
import { errorHandler } from '../../middleware/errors';
import * as Sentry from "@sentry/node";
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
  router: express.Router,
): Promise<Server> => {
  logger.debug('Starting server');

  const apolloIndex = createApolloIndexServer();
  const apolloDrive = createApolloDriveServer();

  await apolloIndex.start();
  await apolloDrive.start();

  router.use(
    '/drives',
    cors<cors.CorsRequest>(),
    cookierParser(undefined, { decode: (value: string) => value }),
    bodyParser.json(),
    expressMiddleware(apolloIndex, {
      context: async (params) => createIndexContext(params),
    }),
  );

  router.use(
    '/d/:driveId',
    cors<cors.CorsRequest>(),
    cookierParser(undefined, { decode: (value: string) => value }),
    bodyParser.json(),
    expressMiddleware(apolloDrive, {
      context: async (params) => createDriveContext(params),
    }),
  );

  const basePath = process.env.BASE_PATH || '/';
  app.use(basePath, router);

  const httpServer = createHttpServer(app);
  app.use(errorHandler);
  if (process.env.SENTRY_DSN) {
    app.use(Sentry.Handlers.errorHandler());
  }
  return httpServer.listen({ port: PORT }, () => {
    logger.info(`Running on ${PORT}`);
  });
};
