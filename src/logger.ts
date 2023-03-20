import path from 'path';
import pino from 'pino';
import pinoHttp from 'pino-http';
import {
  logLevel, httpLogLevel, moduleFilter, prefixFilter,
} from './env';

const formatPrefix = (prefix: string): string => `[${prefix.toUpperCase()}] `;

const filterPrefix = (config: {options: pino.ChildLoggerOptions, bindings: pino.Bindings}): boolean => {
  if (prefixFilter.length === 0) {
    return true;
  }
  const { options } = config;
  const { msgPrefix } = options;
  const prefix = formatPrefix(msgPrefix || '')
  if (prefix && prefixFilter.map(p => formatPrefix(p)).includes(prefix)) {
    return true
  }
  return false
}

const filterModule = (config: {options: pino.ChildLoggerOptions, bindings: pino.Bindings}): boolean => {
  if (moduleFilter.length === 0) {
    return true;
  }
  const { bindings } = config;
  const { module: mod } = bindings;
  if (mod && moduleFilter.includes(mod)) {
    return true
  }
  return false
}

const FILTERS = [filterModule, filterPrefix]

const doesPassFilters = (config: {options: pino.ChildLoggerOptions, bindings: pino.Bindings}): boolean => {
  return FILTERS.every(f => f(config))
}

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

export const getChildLogger = (options: pino.ChildLoggerOptions, bindings: pino.Bindings) => {
  const localOptions = { ...options };
  if (!doesPassFilters({ options: localOptions, bindings })) {
    localOptions.level = 'silent';
  }
  localOptions.msgPrefix = localOptions.msgPrefix ? formatPrefix(localOptions.msgPrefix) : '';
  return logger.child(bindings, localOptions);
};

export default logger;
