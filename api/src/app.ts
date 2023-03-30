import type { Express } from 'express';
import express from 'express';
import expressPlayground from 'graphql-playground-middleware-express';
import { getChildLogger } from './logger';

const logger = getChildLogger({ msgPrefix: 'APP' });

export const createApp = (): Express => {
  logger.debug('Creating app');
  const app = express();

  app.get('/', expressPlayground({
    endpoint: '/api/graphql',
    settings: {
      'editor.theme': 'light',
    },
  }));

  return app;
};
