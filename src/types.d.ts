import type { Level as PinoLevel } from 'pino';

export type DbLogLevel = 'info' | 'query' | 'warn' | 'error';

export declare interface LoggerConfig {
  moduleFilter: string[];
  prefixFilter: string[];
  logLevel: PinoLevel;
  dbLogLevel: DbLogLevel[];
  httpLogLevel: PinoLevel;
}
