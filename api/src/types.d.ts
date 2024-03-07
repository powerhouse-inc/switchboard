import type { Level as PinoLevel } from 'pino';
import { Prisma } from '@prisma/client';

export declare interface LoggerConfig {
  moduleFilter: string[];
  debugModules: [],
  prefixFilter: string[];
  logLevel: PinoLevel;
  dbLogLevel: Prisma.LogLevel[];
  httpLogLevel: PinoLevel;
}
