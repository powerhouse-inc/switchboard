import { Prisma } from '@prisma/client';
import type { Level as PinoLevel } from 'pino';

export declare interface LoggerConfig {
  moduleFilter: string[];
  prefixFilter: string[];
  logLevel: PinoLevel;
  dbLogLevel: Prisma.LogLevel[];
  httpLogLevel: PinoLevel;
}
