import type { Express } from 'express';
import cors from 'cors';
import express from 'express';
import expressPlayground from 'graphql-playground-middleware-express';
import { expressLogger, getChildLogger } from './logger';

const logger = getChildLogger({ msgPrefix: 'APP' });

export const createApp = (): Express => {
  logger.debug('Creating app');
  const app = express();

  app.use(expressLogger);
  app.use(cors());

  app.get('/', expressPlayground({ endpoint: '/graphql' }));

  return app;
};
