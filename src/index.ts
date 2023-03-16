import type { Server } from 'http';
import { createServer as createHttpServer } from 'http';
import { ApolloServer } from 'apollo-server-express';
import { applyMiddleware } from 'graphql-middleware';
import type express from 'express';
import { PORT, isDevelopment } from './env';
import { createApp } from './app';
import { createContext } from './context';
import { schema } from './schema';
import logger from './logger';

export const schemaWithMiddleware = applyMiddleware(schema);

const createApolloServer = (): ApolloServer => new ApolloServer({
  schema: schemaWithMiddleware,
  context: createContext,
  introspection: isDevelopment,
});

export const startServer = async (
  app: express.Application,
): Promise<Server> => {
  logger.debug('Starting server');
  const httpServer = createHttpServer(app);
  const apollo = createApolloServer();

  await apollo.start();
  apollo.applyMiddleware({ app });

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
