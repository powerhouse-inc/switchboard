import type { Server } from 'http';
import { createServer as createHttpServer } from 'http';
import { ApolloServerPlugin, ApolloServer } from '@apollo/server';
import type express from 'express';
import { expressMiddleware } from '@apollo/server/express4';
import bodyParser from 'body-parser';
import cors from 'cors';
import { PORT } from './env';
import { schemaWithMiddleware } from './schema';
import { Context, createContext } from './context';
import { getChildLogger } from './logger';

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
  introspection: true,
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
