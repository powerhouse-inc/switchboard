import pino from 'pino';
import pinoHttp from 'pino-http';
import { logLevel, httpLogLevel } from './env';

export const expressLogger = pinoHttp(
  {
    level: httpLogLevel,
    transport: {
      target: 'pino-pretty',
    },
  },
);

const logger = pino({
  level: logLevel,
  transport: {
    target: 'pino-pretty',
  },
});

export default logger;
