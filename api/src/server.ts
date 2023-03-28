import type { Server } from 'http';
import { createServer as createHttpServer } from 'http';
import { ApolloServer } from 'apollo-server-express';
import type express from 'express';
import { PORT, isDevelopment } from './env';
import { createContext } from './context';
import { schemaWithMiddleware } from './schema';

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
  return httpServer.listen({ port: usedPort }, () => {});
};
