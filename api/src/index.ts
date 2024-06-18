import type express from 'express';
import * as Sentry from '@sentry/node';
import { type Server, createServer as createHttpServer } from 'http';
import { WebSocketServer } from 'ws';
import { createApp } from './app';
import { addGraphqlRoutes } from './graphql/server';
import { getChildLogger } from './logger';
import { initRedis, closeRedis } from './redis';
import { PORT } from './env';
import { errorHandler } from './middleware/errors';
import 'express-async-errors';

const logger = getChildLogger({ msgPrefix: 'SERVER' });

const { app, router } = createApp();

async function startServer(
  // eslint-disable-next-line @typescript-eslint/no-shadow
  app: express.Application,
  // eslint-disable-next-line @typescript-eslint/no-shadow
  router: express.Router
): Promise<Server> {
  const httpServer = createHttpServer(app);

  // create websocket server
  const wsServer = new WebSocketServer({
    noServer: true,
  });

  // allow setting up socket connection
  httpServer.on('upgrade', (request, socket, head) => {
    if (
      request.headers['upgrade'] === 'websocket' &&
      request.url?.match(/(?<=\/d\/)([^\/]*)\/ws/)
    ) {
      wsServer.handleUpgrade(request, socket, head, (ws) => {
        wsServer.emit('connection', ws, request);
      });
    } else {
      socket.destroy();
    }
  });

  await addGraphqlRoutes(router, httpServer, wsServer);

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
  return httpServer.listen({ port: PORT }, () => {
    logger.info(`Running on ${PORT}`);
  });
}

/* istanbul ignore next @preserve */
startServer(app, router)
  .then((e) => {
    // Hot Module Replacement
    const { hot } = import.meta as any;
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
