import { ApolloServer, ApolloServerPlugin } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import cookierParser from 'cookie-parser';
import cors from 'cors';
import type express from 'express';
import NotFoundError from '../../errors/NotFoundError';
import { getExtendedPrisma } from '../../importedModules';
import {
  Context as DriveContext,
  createContext as createDriveContext
} from './drive/context';
import { schemaWithMiddleware as driveSchema } from './drive/schema';
import {
  Context,
  Context as IndexContext,
  createContext as createIndexContext
} from './index/context';
import { schemaWithMiddleware as indexSchema } from './index/schema';

function loggerPlugin(): ApolloServerPlugin<Context> {
  return {
    async requestDidStart() {
      return {
        async didEncounterErrors(c) {
          c.errors?.forEach(e => {
            c.contextValue.apolloLogger.error({ err: e }, e.message);
          });
        }
      };
    }
  };
}

const createApolloIndexServer = (): ApolloServer<IndexContext> =>
  new ApolloServer<IndexContext>({
    schema: indexSchema,
    introspection: true,
    status400ForVariableCoercionErrors: true,
    plugins: [loggerPlugin()]
  });

const createApolloDriveServer = (): ApolloServer<DriveContext> =>
  new ApolloServer<DriveContext>({
    schema: driveSchema,
    introspection: true,
    status400ForVariableCoercionErrors: true,
    plugins: [loggerPlugin()]
  });

export const addGraphqlRoutes = async (router: express.Router) => {
  const apolloIndex = createApolloIndexServer();
  const apolloDrive = createApolloDriveServer();

  await apolloIndex.start();
  await apolloDrive.start();

  router.use(
    '/drives',
    cors<cors.CorsRequest>(),
    cookierParser(undefined, { decode: (value: string) => value }),
    expressMiddleware(apolloIndex, {
      context: async params => createIndexContext(params)
    })
  );

  router.use(
    '/d/:driveId',
    cors<cors.CorsRequest>(),
    cookierParser(undefined, { decode: (value: string) => value }),
    async (req, res, next) => {
      const prisma = getExtendedPrisma();
      const { driveId } = req.params;

      if (!driveId) {
        throw new Error('driveId required');
      }

      try {
        await prisma.document.getDrive(driveId);
      } catch (e) {
        throw new NotFoundError({ message: (e as Error).message });
      }
      next();
    },
    expressMiddleware(apolloDrive, {
      context: async params => createDriveContext(params)
    })
  );
};

export { Context };
