import type express from 'express';
import * as Sentry from "@sentry/node";
import { createApp } from './app';
import { addGraphqlRoutes } from './graphql/server';
import { getChildLogger } from './logger';
import { closeRedis } from './redis';
import { Server, createServer as createHttpServer } from 'http';
import { PORT } from './env';
import { errorHandler } from './middleware/errors';
import { initRedis } from './redis';
import "express-async-errors";

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

  const httpServer = createHttpServer(app);
  return httpServer.listen({ port: PORT }, () => {
    logger.info(`Running on ${PORT}`);
  });
}


/* istanbul ignore next @preserve */
startServer(app, router)
  .then((e) => {
    // Hot Module Replacement
    if (import.meta.hot) {
      import.meta.hot.on("vite:beforeFullReload", () => {
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
