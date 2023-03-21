import { LoggerConfig } from './src/types';

export const loggerConfig: LoggerConfig = {
  // Filter by module name
  moduleFilter: [],
  // Filter by log prefix, e.g. adding
  // `pref` to filter is going to correspond to showing `[PERF]` logs
  prefixFilter: [],
  // Lowest printed log level of default logger
  logLevel: 'info',
  // Lowest printed log level of prisma logger
  dbLogLevel: ['info'],
  // Lowest printed log level of express logger
  httpLogLevel: 'info',
};
