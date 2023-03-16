import path from 'path';
import pino from 'pino';
import pinoHttp from 'pino-http';
import { logLevel, httpLogLevel, moduleFilter } from './env';

export const expressLogger = pinoHttp(
  {
    level: httpLogLevel,
    msgPrefix: '[EXPRESS]: ',
    transport: {
      target: 'pino-pretty',
    },
  },
);

export const getModuleBinding = (filename: string) => path.relative(__dirname, filename);

const logger = pino({
  level: logLevel,
  transport: {
    target: 'pino-pretty',
  },
});

export const getChildLogger = (prefix: string, bindings: pino.Bindings) => {
  const options: { msgPrefix: string, level?: string } = {
    msgPrefix: `[${prefix}] `,
  };
  if (moduleFilter.length === 0) {
    return logger.child(bindings, options);
  }
  if (!moduleFilter.includes(bindings.module)) {
    options.level = 'silent';
  }
  return logger.child(bindings, options);
};
// applyModuleFilter(logger.child(bindings, { msgPrefix: `[${prefix}] ` }));

export default logger;
