import type { Express } from 'express';
import express from 'express';
import expressPlayground from 'graphql-playground-middleware-express';
import { getChildLogger } from './logger';
import prisma from './database';

const logger = getChildLogger({ msgPrefix: 'APP' });
const startupTime = new Date();

/* istanbul ignore next @preserve */
export const createApp = (): Express => {
  logger.debug('Creating app');
  const app = express();

  app.get('/healthz', async (_req, res) => {
    try {
      await prisma.user.findFirst();
    } catch (error) {
      return res.status(500).json({
        status: 'DB failed initialization check',
        time: new Date(),
        startupTime,
      });
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
