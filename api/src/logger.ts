import path from 'path';
import pino from 'pino';
import pinoHttp from 'pino-http';
import { loggerConfig } from '../logger.config';
import { createWriteStream, Sentry } from "pino-sentry";
const {
  moduleFilter, prefixFilter, logLevel, httpLogLevel,
} = loggerConfig;

const formatPrefix = (prefix: string): string => `[${prefix.toUpperCase()}] `;
const PROJECT_ROOT = path.resolve(__dirname, '..');

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

const transport = process.env.SENTRY_DSN ? {
  target: "pino-sentry-transport",
  options: {
    sentry: {
      dsn: process.env.SENTRY_DSN,
      // additional options for sentry
    },
    withLogRecord: true, // default false - send the log record to sentry as a context.(if its more then 8Kb Sentry will throw an error)
    tags: ['id'], // sentry tags to add to the event, uses lodash.get to get the value from the log record
    context: ['hostname'], // sentry context to add to the event, uses lodash.get to get the value from the log record,
    minLevel: 40, // which level to send to sentry
  }
} : {
  target: 'pino-pretty',
}
export const expressLogger = pinoHttp({
  level: httpLogLevel,
  msgPrefix: formatPrefix('express'),
  transport,
});

const logger = pino({
  level: logLevel,
  transport,
});

export const getChildLogger = (
  options?: pino.ChildLoggerOptions,
  bindings?: pino.Bindings,
) => {
  // get caller module of this function
  const caller = Error().stack?.split('at ')[2].trim().split(':')[0] || '';
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
