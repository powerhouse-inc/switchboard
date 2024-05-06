import type { Server } from 'http';
import { createServer as createHttpServer } from 'http';
import type express from 'express';
import { ApolloServerPlugin, ApolloServer } from '@apollo/server';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';
import { expressMiddleware } from '@apollo/server/express4';
import bodyParser from 'body-parser';
import cookierParser from 'cookie-parser';
import cors from 'cors';
import { WebSocketServer } from 'ws';
import { useServer } from 'graphql-ws/lib/use/ws';
import { CloseCode, makeServer } from 'graphql-ws';
import { PORT } from '../../env';
import { schemaWithMiddleware as indexSchema } from './index/schema';
import { schemaWithMiddleware as driveSchema } from './drive/schema';
import { Context, Context as IndexContext, createContext as createIndexContext } from './index/context';
import { Context as DriveContext, createContextWebsocket, createContext as createDriveContext } from './drive/context';
import { getChildLogger } from '../../logger';
import "express-async-errors";
import { errorHandler } from '../../middleware/errors';
import * as Sentry from "@sentry/node";
import { initRedis } from '../../redis';

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

const createApolloIndexServer = (httpServer: Server, plugins: ApolloServerPlugin<IndexContext>[] = []): ApolloServer<IndexContext> => new ApolloServer<IndexContext>({
  schema: indexSchema,
  introspection: true,
  plugins: [
    loggerPlugin(),
    ApolloServerPluginDrainHttpServer({ httpServer }),
    ...plugins
  ],
});

const createApolloDriveServer = (plugins: ApolloServerPlugin<DriveContext>[] = []): ApolloServer<DriveContext> => new ApolloServer<DriveContext>({
  schema: driveSchema,
  introspection: true,
  plugins: [loggerPlugin(), ...plugins],
});

export const startServer = async (
  app: express.Application,
  router: express.Router,
): Promise<Server> => {
  logger.debug('Starting server');

  if (process.env.REDIS_TLS_URL) {
    await initRedis();
  }

  const httpServer = createHttpServer(app);


  // create websocket server
  const wsServer = new WebSocketServer({
    noServer: true
  });

  // add handlers for drive schema
  const driveWsServer = useServer({
    schema: driveSchema, context: (ctx) => {
      return createContextWebsocket(ctx.extra.request);
    }
  }, wsServer);

  // allow setting up socket connection
  httpServer.on('upgrade', (request, socket, head) => {
    if (request.headers['upgrade'] === "websocket" && request.url?.match(/(?<=\/d\/)([^\/]*)\/ws/)) {
      wsServer.handleUpgrade(request, socket, head, (ws) => {
        wsServer.emit('connection', ws, request);
      });
    } else {
      socket.destroy();
    }
  });

  const apolloIndex = createApolloIndexServer(httpServer);
  const apolloDrive = createApolloDriveServer([{
    async serverWillStart() {
      return {
        async drainServer() {
          await driveWsServer.dispose();
        },
      };
    },
  }]);

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
    // async (req, res, next) => {
    //   const { operationName, query, variables } = getGraphQLParameters(req);
    //   if (query?.includes("subscribeStrands(")) {
    //     // const context = createDriveContext({ req, res });
    //     return driveSseHandler(req, res);
    //   }
    //   return next();
    // },
    expressMiddleware(apolloDrive, {
      context: async (params) => createDriveContext(params),
    }),
  );

  const basePath = process.env.BASE_PATH || '/';
  app.use(basePath, router);
  app.use(errorHandler);
  if (process.env.SENTRY_DSN) {
    app.use(Sentry.Handlers.errorHandler());
  }
  return httpServer.listen({ port: PORT }, () => {
    logger.info(`Running on ${PORT}`);
  });
};
