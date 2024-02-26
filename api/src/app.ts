import type { Express } from 'express';
import express from 'express';
import { getChildLogger } from './logger';
import basePrisma from './database';
import {
  renderPlaygroundPage,
} from 'graphql-playground-html'

const logger = getChildLogger({ msgPrefix: 'APP' });
const startupTime = new Date();

export const createApp = (): Express => {
  logger.debug('Creating app');
  const app = express();

  app.get('/healthz', async (_req, res) => {
    try {
      await basePrisma.user.findFirst();
    } catch (error: any) {
      return res.status(500).json({
        status: `Failed database initialization check with error: ${error?.message}`,
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
    '/explorer/:driveId?',
    (req, res) => {
      res.setHeader('Content-Type', 'text/html')
      const endpoint = req.params.driveId !== undefined ? `/d/${req.params.driveId}` : '/drives'
      res.send(renderPlaygroundPage({
        endpoint: endpoint,
        settings: {
          'request.credentials': 'include',
        },
      }))
    }
  );

  return app;
};
