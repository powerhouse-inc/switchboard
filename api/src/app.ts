import type { Express } from 'express';
import express from 'express';
import { getChildLogger } from './logger';
import basePrisma from './database';
import { renderPlaygroundPage } from 'graphql-playground-html';
import * as Sentry from '@sentry/node';
import { nodeProfilingIntegration } from '@sentry/profiling-node';
import bodyParser from 'body-parser';
import prisma from './database';

import { dependencies } from '../package.json';

const logger = getChildLogger({ msgPrefix: 'APP' });
const startupTime = new Date();

export const createApp = (): { app: Express; router: express.Router } => {
  logger.debug('Creating app');
  const app = express();
  const router = express.Router();

  // fixes request entity too large
  app.use(bodyParser.json({ limit: '50mb' }));
  app.use(
    bodyParser.urlencoded({
      limit: '50mb',
      extended: true,
      parameterLimit: 50000,
    })
  );

  if (process.env.SENTRY_DSN) {
    Sentry.init({
      dsn: process.env.SENTRY_DSN,
      environment: process.env.SENTRY_ENV ?? 'dev',
      integrations: [
        nodeProfilingIntegration(),
        new Sentry.Integrations.Express({
          app,
        }),
      ],
      tracesSampleRate: 1.0,
      ignoreErrors: [
        /Transmitter .+ not found/,
        /^Failed to fetch strands$/,
        /Drive with id .+ not found/,
        /Document with id .+ not found/,
        'Drive not found',
      ],
    });

    app.use(Sentry.Handlers.requestHandler());
    app.use(Sentry.Handlers.tracingHandler());
  }

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

  app.get('/versions', async (req, res) => {
    const {
      'document-drive': docDrive,
      'document-model': docModel,
      'document-model-libs': docModelLibs,
    } = dependencies;
    res.send({
      'document-drive': docDrive,
      'document-model': docModel,
      'document-model-libs': docModelLibs,
    });
  });

  router.get('/explorer/:driveId?', (req, res) => {
    res.setHeader('Content-Type', 'text/html');
    const basePath =
      process.env.BASE_PATH === '/' ? '' : process.env.BASE_PATH || '';
    const endpoint = `${basePath}${
      req.params.driveId !== undefined ? `/d/${req.params.driveId}` : '/drives'
    }`;
    res.send(
      renderPlaygroundPage({
        endpoint: endpoint,
        settings: {
          'request.credentials': 'include',
        },
      })
    );
  });

  // Hooks
  router.post('/h/github', async (req, res) => {
    const issueId = req.body?.issue?.number;
    const action = req.body?.action;

    if (action !== 'closed') {
      return res.sendStatus(200);
    }

    if (!issueId) {
      throw new Error('Issue number not found in request body');
    }

    const result = await prisma.document.closeScopeOfWorkIssue(
      req.body.issue.number
    );
    if (!result) {
      throw new Error('Failed to close issue');
    }

    return res.sendStatus(200).send(result);
  });

  const basePath = process.env.BASE_PATH || '/';
  app.use(basePath, router);

  return { app, router };
};
