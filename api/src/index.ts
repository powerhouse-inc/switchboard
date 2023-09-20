import {setupAll} from './setupPlugins'
setupAll();

import { createApp } from './app';
import { startServer } from './graphql/server';
import { getChildLogger } from './logger';

const logger = getChildLogger({ msgPrefix: 'SERVER' });

const application = createApp();

/* istanbul ignore next @preserve */
startServer(application)
  .catch((err) => {
    logger.warn('Shutting down...');
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
