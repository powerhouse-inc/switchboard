import type { Server } from 'http';
import { createServer as createHttpServer } from 'http';
import { ApolloServer } from 'apollo-server-express';
import type express from 'express';
import { createApp } from './app';
import { PORT, isDevelopment } from './env';
import { createContext } from './context';
import { schemaWithMiddleware } from './schema';

const application = createApp();

const createApolloServer = (): ApolloServer => new ApolloServer({
  schema: schemaWithMiddleware,
  context: createContext,
  introspection: isDevelopment,
});

export const startServer = async (
  app: express.Application,
  port?: number,
): Promise<Server> => {
  const httpServer = createHttpServer(app);
  const apollo = createApolloServer();
  await apollo.start();
  apollo.applyMiddleware({ app });
  const usedPort = port || PORT;
  return httpServer.listen({ port: usedPort }, () => {
    process.stdout.write(
      `🚀 Server ready at port ${usedPort}`,
    );
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
