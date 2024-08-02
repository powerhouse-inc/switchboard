import path from 'path';
import pino from 'pino';
import pinoHttp from 'pino-http';
import * as Sentry from '@sentry/node';
import { loggerConfig } from '../logger.config';
import { isDevelopment } from './env';

const {
  moduleFilter, prefixFilter, logLevel, httpLogLevel,
} = loggerConfig;

export const dirname = (() => {
  if (typeof __dirname !== 'undefined') {
    return __dirname;
  }
  if (import.meta.dirname) {
    return import.meta.dirname;
  }
  return process.cwd();
})();

const formatPrefix = (prefix: string): string => `[${prefix.toUpperCase()}] `;
const PROJECT_ROOT = path.resolve(dirname, '..');

const filterPrefix = (config: {
  options: pino.ChildLoggerOptions;
  bindings: pino.Bindings;
}): boolean => {
  if (prefixFilter.length === 0) {
    return true;
  }
  const { options } = config;
  const { msgPrefix } = options;
  const prefix = formatPrefix(msgPrefix || '');
  if (prefix && prefixFilter.map((p) => formatPrefix(p)).includes(prefix)) {
    return true;
  }
  return false;
};

const filterModule = (config: {
  options: pino.ChildLoggerOptions;
  bindings: pino.Bindings;
}): boolean => {
  if (moduleFilter.length === 0) {
    return true;
  }
  const { bindings } = config;
  const { moduleName } = bindings;
  if (moduleName && moduleFilter.includes(moduleName)) {
    return true;
  }
  return false;
};

const FILTERS = [filterModule, filterPrefix];

const doesPassFilters = (config: {
  options: pino.ChildLoggerOptions;
  bindings: pino.Bindings;
}): boolean => FILTERS.every((f) => f(config));

const transportTargets: pino.TransportTargetOptions[] = [];

if (isDevelopment) {
  transportTargets.push({
    target: 'pino-pretty',
  });
}

if (process.env.SENTRY_DSN) {
  transportTargets.push({
    target: 'pino-sentry-transport',
    options: {
      sentry: {
        dsn: process.env.SENTRY_DSN,
        environment: process.env.SENTRY_ENV ?? 'dev',
        ignoreErrors: [
          /Transmitter(?: .+)? not found/,
          /^Failed to fetch strands$/,
          /Drive with id .+ not found/,
          /Document with id .+ not found/,
          'Drive not found',
        ],
        // additional options for sentry
      },
      withLogRecord: true, // default false - send the log record to sentry as a context.(if its more then 8Kb Sentry will throw an error)
      tags: ['id'], // sentry tags to add to the event, uses lodash.get to get the value from the log record
      context: ['hostname'], // sentry context to add to the event, uses lodash.get to get the value from the log record,
      minLevel: 40, // which level to send to sentry
    },
  });
}

const { LOKI_URL, LOKI_USERNAME, LOKI_PASSWORD, LOKI_ENV } = process.env;
if (LOKI_URL && LOKI_USERNAME && LOKI_PASSWORD) {
  const basePath = process.env.BASE_PATH || '/';
  const baseElements = basePath.split('/');

  const labels = {
    team: baseElements[2] ?? 'powerhouse',
    application: baseElements[3] ?? 'switchboard',
    env: LOKI_ENV ?? baseElements[1] ?? 'develop',
  };

  transportTargets.push({
    target: 'pino-loki',
    options: {
      batching: true,
      interval: 5,
      labels,
      host: LOKI_URL,
      basicAuth: {
        username: LOKI_USERNAME,
        password: LOKI_PASSWORD,
      },
    },
  });
}

export const expressLogger = pinoHttp({
  level: httpLogLevel,
  msgPrefix: formatPrefix('express'),
  transport: {
    targets: transportTargets,
  },
});

const logger = pino({
  level: logLevel,
  transport: {
    targets: transportTargets,
  },
});

export const getChildLogger = (
  options?: pino.ChildLoggerOptions,
  bindings?: pino.Bindings,
) => {
  // get caller module of this function
  const caller = Error().stack?.split('at ').at(2)?.trim().split(':')[0] || '';
  const localOptions = { ...options };
  const appliedBindings: pino.Bindings = {
    module: path.relative(PROJECT_ROOT, caller),
    ...(bindings || {}),
  };
  if (!doesPassFilters({ options: localOptions, bindings: appliedBindings })) {
    localOptions.level = 'silent';
  }
  localOptions.msgPrefix = localOptions.msgPrefix
    ? formatPrefix(localOptions.msgPrefix)
    : '';
  return logger.child(appliedBindings, localOptions);
};

export default logger;
