import * as Sentry from '@sentry/node';
import type express from 'express';
import 'express-async-errors';
import { type Server, createServer as createHttpServer } from 'http';
import { createApp } from './app';
import prisma from './database';
import { PORT } from './env';
import { addGraphqlRoutes } from './graphql/server';
import { getChildLogger } from './logger';
import register from './metrics';
import { errorHandler } from './middleware/errors';
import { closeRedis, initRedis } from './redis';
import { initKYCService } from './modules/renown/kyc-service';

const logger = getChildLogger({ msgPrefix: 'SERVER' });

async function startServer(): Promise<Server> {
  logger.info('Starting server');
  // init services
  if (process.env.REDIS_TLS_URL) {
    await initRedis();
  }
  await initKYCService();

  const { app, router } = createApp();
  // add graphql routes to router
  await addGraphqlRoutes(router);

  // configure base path for router
  const basePath = process.env.BASE_PATH || '/';
  app.use(basePath, router);

  // configure sentry
  if (process.env.SENTRY_DSN) {
    app.use(Sentry.Handlers.errorHandler());
  }

  // add error handler
  app.use(errorHandler);

  // add metrics
  router.get(
    '/metrics',
    async (req: express.Request, res: express.Response) => {
      const prismaMetrics = await prisma.$metrics.prometheus();
      const appMetrics = await register.metrics();
      return res.send(prismaMetrics + appMetrics);
    }
  );

  // instantiate http server
  const httpServer = createHttpServer(app);
  return httpServer.listen({ port: PORT }, () => {
    logger.info(`Running on ${PORT}`);
  });
}

/* istanbul ignore next @preserve */
startServer()
  .then(e => {
    // Hot Module Replacement
    const { hot } = import.meta as any;
    if (hot) {
      hot.on('vite:beforeFullReload', () => {
        e.close();
      });
    }
  })
  .catch(err => {
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
