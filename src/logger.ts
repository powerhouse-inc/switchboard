import path from 'path';
import pino from 'pino';
import pinoHttp from 'pino-http';
import {
  logLevel, httpLogLevel, moduleFilter, prefixFilter,
} from './env';

const formatPrefix = (prefix: string): string => `[${prefix.toUpperCase()}] `;

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
  localOptions.msgPrefix = localOptions.msgPrefix
    ? formatPrefix(localOptions.msgPrefix) : localOptions.msgPrefix;
  const formattedPrefixFilter = prefixFilter.map(formatPrefix);
  const isModuleFilterEmpty = moduleFilter.length === 0;
  const isPrefixFilterEmpty = formattedPrefixFilter.length === 0;
  if (!isModuleFilterEmpty && !moduleFilter.includes(bindings.module)) {
    localOptions.level = 'silent';
  }
  if (isPrefixFilterEmpty) {
    return logger.child(bindings, localOptions);
  }
  const providedPrefix = localOptions.msgPrefix ?? '';
  if (!formattedPrefixFilter.includes(providedPrefix)) {
    localOptions.level = 'silent';
  }
  return logger.child(bindings, localOptions);
};

export default logger;
