import { LoggerConfig } from './src/types';

export const defaultLoggerConfig: LoggerConfig = {
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

export const debugLogConfig: LoggerConfig = {
  // Filter by module name
  moduleFilter: [],
  // Filter by log prefix, e.g. adding
  // `pref` to filter is going to correspond to showing `[PERF]` logs
  prefixFilter: [],
  // Lowest printed log level of default logger
  logLevel: 'debug',
  // Lowest printed log level of prisma logger
  dbLogLevel: ['query'],
  // Lowest printed log level of express logger
  httpLogLevel: 'debug',
};

function getLoggerConfig(debug: boolean): LoggerConfig {
  return (debug ? debugLogConfig : defaultLoggerConfig);
}
export const loggerConfig = getLoggerConfig(!!process.env.DEBUG);
