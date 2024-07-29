import type express from 'express';
import * as Sentry from '@sentry/node';
import { type Server, createServer as createHttpServer } from 'http';
import { createApp } from './app';
import { addGraphqlRoutes } from './graphql/server';
import { getChildLogger } from './logger';
import { closeRedis, initRedis } from './redis';
import { PORT } from './env';
import { errorHandler } from './middleware/errors';
import 'express-async-errors';
import prisma from './database';
import register from './metrics';
import promBundle from 'express-prom-bundle';

const logger = getChildLogger({ msgPrefix: 'SERVER' });

const { app, router } = createApp();

async function startServer(
  app: express.Application,
  router: express.Router,
): Promise<Server> {
  await addGraphqlRoutes(router);

  logger.debug('Starting server');

  if (process.env.REDIS_TLS_URL) {
    await initRedis();
  }

  const basePath = process.env.BASE_PATH || '/';
  app.use(basePath, router);

  if (process.env.SENTRY_DSN) {
    app.use(Sentry.Handlers.errorHandler());
  }

  app.use(errorHandler);
  router.get('/metrics', async (req: express.Request, res: express.Response) => {
    const prismaMetrics = await prisma.$metrics.prometheus();
    const appMetrics = await register.metrics();
    return res.send(prismaMetrics + appMetrics);
  });

  const httpServer = createHttpServer(app);
  return httpServer.listen({ port: PORT }, () => {
    logger.info(`Running on ${PORT}`);
  });
}

/* istanbul ignore next @preserve */
startServer(app, router)
  .then((e) => {
    // Hot Module Replacement
    const { hot } = (import.meta as any);
    if (hot) {
      hot.on('vite:beforeFullReload', () => {
        e.close();
      });
    }
  })
  .catch((err) => {
    logger.warn('Shutting down...');
    closeRedis();
    if (err instanceof Error) {
      logger.error(err);
    } else {
      logger.error(`An unknown error has occurred.
Please open an issue on github (https://github.com/makerdao-ses/switchboard-boilerplate/issues/new)
with the below context:`);
      logger.info(err);
    }
    process.exit(1);
  });
