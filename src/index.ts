import type { Server } from 'http';
import { createServer as createHttpServer } from 'http';
import { applyMiddleware } from 'graphql-middleware';
import type express from 'express';
import { expressMiddleware } from '@apollo/server/express4';
import { ApolloServerPlugin, ApolloServer } from '@apollo/server';
import bodyParser from 'body-parser';
import cors from 'cors';
import { PORT, isDevelopment } from './env';
import { createApp } from './app';
import { Context, createContext } from './context';
import { schema } from './schema';
import { getChildLogger } from './logger';

export const schemaWithMiddleware = applyMiddleware(schema);
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

const createApolloServer = (): ApolloServer<Context> => new ApolloServer<Context>({
  schema: schemaWithMiddleware,
  introspection: isDevelopment,
  plugins: [loggerPlugin()],
});

export const startServer = async (
  app: express.Application,
): Promise<Server> => {
  logger.debug('Starting server');
  const httpServer = createHttpServer(app);
  const apollo = createApolloServer();

  await apollo.start();
  app.use('/', cors<cors.CorsRequest>(), bodyParser.json(), expressMiddleware(apollo, {
    context: async (params) => (createContext(params)),
  }));

  return httpServer.listen({ port: PORT }, () => {
    logger.info(`Running on ${PORT}`);
  });
};

const app = createApp();

startServer(app)
  .then(() => {
    // This should never happen, is only here until we add the real API which of course runs forever
    logger.info('API execution ended');
  })
  .catch((err) => {
    logger.warn('Shutting down...');
    if (err instanceof Error) {
      logger.error(err);
    } else {
      logger.error('An unknown error has occurred. Please open an issue on github (https://github.com/makerdao-ses/switchboard-boilerplate/issues/new) with the below context:');
      logger.info(err);
    }
    process.exit(1);
  });
