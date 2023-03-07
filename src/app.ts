import type { Express } from 'express';
import cors from 'cors';
import express from 'express';
import { altairExpress } from 'altair-express-middleware';
import { PORT } from './env';

export const createApp = (): Express => {
  const app = express();

  app.use(cors());

  app.use(
    '/',
    altairExpress({
      endpointURL: '/graphql',
      subscriptionsEndpoint: `ws://localhost:${PORT}/graphql`,
    }),
  );

  return app;
};
