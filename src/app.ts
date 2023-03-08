import type { Express } from 'express';
import cors from 'cors';
import express from 'express';
import expressPlayground from 'graphql-playground-middleware-express';

export const createApp = (): Express => {
  const app = express();

  app.use(cors());

  app.get('/', expressPlayground({ endpoint: '/graphql' }));

  return app;
};
