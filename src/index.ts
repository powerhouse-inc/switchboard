import type { Server } from 'http';
import { createServer as createHttpServer } from 'http';
import { ApolloServer } from 'apollo-server-express';
import type express from 'express';
import type { Disposable } from 'graphql-ws';
import { ApolloServerPluginDrainHttpServer } from 'apollo-server-core';
import { createApp } from './app';
import { PORT, isDevelopment } from './env';
import { createContext } from './context';
import { schemaWithMiddleware } from './schema';

let serverCleanup: Disposable;
const application = createApp();

const createApolloServer = (httpServer: Server): ApolloServer => new ApolloServer({
  schema: schemaWithMiddleware,
  context: createContext,
  introspection: isDevelopment,
  plugins: [
    ApolloServerPluginDrainHttpServer({ httpServer }),
    {
      async serverWillStart() {
        return {
          async drainServer() {
            serverCleanup?.dispose();
          },
        };
      },
    },
  ],
});

const initializeApolloServer = (
  apollo: ApolloServer,
  app: express.Application,
  port: number,
): (() => void) => {
  apollo.applyMiddleware({ app });
  return (): void => {
    process.stdout.write(
      `🚀 Server ready at port ${port}`,
    );
  };
};

const startServer = async (
  app: express.Application,
): Promise<Server> => {
  const httpServer = createHttpServer(app);
  const apollo = createApolloServer(httpServer);
  await apollo.start();
  apollo.applyMiddleware({ app });
  const handleApolloServerInit = initializeApolloServer(
    apollo,
    app,
    PORT,
  );
  return httpServer.listen({ port: PORT }, () => {
    handleApolloServerInit();
  });
};

startServer(application)
  .then(() => {
    // This should never happen, is only here until we add the real API which of course runs forever
    console.info('API execution ended');
  })
  .catch((err) => {
    console.error('Shutting down...');
    if (err instanceof Error) {
      console.error(err);
    } else {
      console.error('An unknown error has occurred. Please open an issue on github (https://github.com/makerdao-ses/switchboard-boilerplate/issues/new) with the below context:');
      console.info(err);
    }
    process.exit(1);
  });
