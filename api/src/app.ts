import type { Express } from 'express';
import express from 'express';
import expressPlayground from 'graphql-playground-middleware-express';
import { getChildLogger } from './logger';
import prisma from './database';

const logger = getChildLogger({ msgPrefix: 'APP' });
const startupTime = new Date();

export const createApp = (): Express => {
  logger.debug('Creating app');
  const app = express();

  app.get('/healthz', async (_req, res) => {
    try {
      await prisma.$queryRaw`SELECT 1;`;
    } catch (error) {
      // TODO: test after migration to postgres, since sqlite will
      // still return success if the file is missing
      res.status(500).send('DB failed initialization check');
    }
    return res.json({
      status: 'healthy',
      time: new Date(),
      startupTime,
    });
  });
  app.get(
    '/',
    expressPlayground({
      endpoint: '/api/graphql',
      settings: {
        'editor.theme': 'light',
      },
    }),
  );

  return app;
};
