type LogLevel = 'trace' | 'debug' | 'info' | 'warn' | 'error' | 'fatal' | 'silent';
type DbLogLevel = 'info' | 'query' | 'warn' | 'error';

export declare interface LoggerConfig {
  moduleFilter: string[];
  prefixFilter: string[];
  logLevel: LogLevel;
  dbLogLevel: DbLogLevel[];
  httpLogLevel: LogLevel;
}
