
import type express from 'express';
import { ApolloServerPlugin, ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import bodyParser from 'body-parser';
import cookierParser from 'cookie-parser';
import cors from 'cors';
import { schemaWithMiddleware as indexSchema } from './index/schema';
import { schemaWithMiddleware as driveSchema } from './drive/schema';
import { Context, Context as IndexContext, createContext as createIndexContext } from './index/context';
import { Context as DriveContext, createContext as createDriveContext } from './drive/context';

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

export const addGraphqlRoutes = async (
  router: express.Router,
) => {
  const apolloIndex = createApolloIndexServer();
  const apolloDrive = createApolloDriveServer();

  await apolloIndex.start();
  await apolloDrive.start();

  // fixes request entity too large
  router.use(bodyParser.json({ limit: "50mb" }));
  router.use(bodyParser.urlencoded({ limit: "50mb", extended: true, parameterLimit: 50000 }));


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
    expressMiddleware(apolloDrive, {
      context: async (params) => createDriveContext(params),
    }),
  );
};

export { Context };
