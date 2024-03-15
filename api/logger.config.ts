import { LoggerConfig } from './src/types';

export const defaultLoggerConfig: LoggerConfig = {
  // Filter by module name
  moduleFilter: [],
  // Filter by log prefix, e.g. adding
  // `pref` to filter is going to correspond to showing `[PREF] ` logs
  prefixFilter: [],
  // Lowest printed log level of default logger
  logLevel: 'info',
  // Log levels of prisma logger that are enabled
  dbLogLevel: ['info'],
  // Lowest printed log level of express logger
  httpLogLevel: 'info',
};

export const debugLogConfig: LoggerConfig = {
  // Filter by module name
  moduleFilter: ["RWA Internal Listener"],
  // Filter by log prefix, e.g. adding
  // `pref` to filter is going to correspond to showing `[PERF]` logs
  prefixFilter: [],
  // Lowest printed log level of default logger
  logLevel: 'debug',
  // Log levels of prisma logger that are enabled
  dbLogLevel: ['query'],
  // Lowest printed log level of express logger
  httpLogLevel: 'debug',
};

function getLoggerConfig(debug: boolean): LoggerConfig {
  return (debug ? debugLogConfig : defaultLoggerConfig);
}

export const loggerConfig = getLoggerConfig(!!process.env.DEBUG);
