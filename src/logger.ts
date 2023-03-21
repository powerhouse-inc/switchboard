import path from 'path';
import pino from 'pino';
import pinoHttp from 'pino-http';
import { loggerConfig } from '../logger.config';

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
  const { module: mod } = bindings;
  if (mod && moduleFilter.includes(mod)) {
    return true;
  }
  return false;
};

const FILTERS = [filterModule, filterPrefix];

const doesPassFilters = (config: {
  options: pino.ChildLoggerOptions;
  bindings: pino.Bindings;
}): boolean => FILTERS.every((f) => f(config));

export const expressLogger = pinoHttp({
  level: httpLogLevel,
  msgPrefix: '[EXPRESS]: ',
  transport: {
    target: 'pino-pretty',
  },
});

const logger = pino({
  level: logLevel,
  transport: {
    target: 'pino-pretty',
  },
});

export const getChildLogger = (
  options?: pino.ChildLoggerOptions,
  bindings?: pino.Bindings,
) => {
  // get caller module of this function
  const caller = Error().stack?.split('at ')[2].trim().split(':')[0] || '';
  const localOptions = { ...options };
  const appliedBindings: pino.Bindings = {
    ...(bindings || {}),
    module: path.relative(PROJECT_ROOT, caller),
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
