
import type express from 'express';
import { ApolloServerPlugin, ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import cookierParser from 'cookie-parser';
import cors from 'cors';
import { schemaWithMiddleware as indexSchema } from './index/schema';
import { schemaWithMiddleware as driveSchema } from './drive/schema';
import { Context, Context as IndexContext, createContext as createIndexContext } from './index/context';
import { Context as DriveContext, createContext as createDriveContext } from './drive/context';
import { getExtendedPrisma } from '../../importedModules';
import NotFoundError from '../../errors/NotFoundError';

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
  status400ForVariableCoercionErrors: true,
  plugins: [loggerPlugin()],
});

const createApolloDriveServer = (): ApolloServer<DriveContext> => new ApolloServer<DriveContext>({
  schema: driveSchema,
  introspection: true,
  status400ForVariableCoercionErrors: true,
  plugins: [loggerPlugin()],
});

export const addGraphqlRoutes = async (
  router: express.Router,
) => {
  const apolloIndex = createApolloIndexServer();
  const apolloDrive = createApolloDriveServer();

  await apolloIndex.start();
  await apolloDrive.start();

  router.use(
    '/drives',
    cors<cors.CorsRequest>(),
    cookierParser(undefined, { decode: (value: string) => value }),
    expressMiddleware(apolloIndex, {
      context: async (params) => createIndexContext(params),
    }),
  );

  router.use(
    '/d/:driveIdOrSlug',
    cors<cors.CorsRequest>(),
    cookierParser(undefined, { decode: (value: string) => value }),
    async (req, res, next) => {
      const { driveIdOrSlug } = req.params;
      if (!driveIdOrSlug) {
        throw new NotFoundError({ message: 'Drive Id or Slug required' });
      }

      const prisma = getExtendedPrisma();
      const drives = await prisma.document.getDrives();
      if (!drives.find(e => e === driveIdOrSlug)) {
        try {
          const drive = prisma.document.getDriveBySlug(driveIdOrSlug);
        } catch (e) {
          throw new NotFoundError({ message: 'Drive not found' });
        }
      }

      next();
    },
    expressMiddleware(apolloDrive, {
      context: async (params) => createDriveContext(params),
    }),
  );
};

export { Context };
