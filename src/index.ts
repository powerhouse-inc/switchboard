import { createApp } from './app';
import { startServer } from './server';
import { getChildLogger } from './logger';

const logger = getChildLogger({ msgPrefix: 'SERVER' });

const application = createApp();
startServer(application)
  .then(() => {
    // This should never happen, is only here until we add the real API which of course runs forever
    logger.info('API execution ended');
  })
  .catch((err) => {
    logger.warn('Shutting down...');
    if (err instanceof Error) {
      logger.error(err);
    } else {
      logger.error('An unknown error has occurred. Please open an issue on github (https://github.com/makerdao-ses/switchboard-boilerplate/issues/new) with the below context:');
      logger.info(err);
    }
    process.exit(1);
  });
