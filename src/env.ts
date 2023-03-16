export const PORT = Number(process.env.PORT ?? '3000');
export const isDevelopment = process.env.NODE_ENV === 'development';

const defaultLogLevels = ['trace', 'debug', 'info', 'warn', 'error', 'fatal', 'silent'];
type DbLogLevel = 'info' | 'query' | 'warn' | 'error';
const allowedDbLogLevels: DbLogLevel[] = ['info', 'query', 'warn', 'error'];

const extractDbLogLevelsFromEnv = (): DbLogLevel[] | undefined => {
  // expected format: "info,query,warn,error"
  const dbLogLevel = process.env.DB_LOG_LEVELS;
  if (!dbLogLevel) {
    return undefined;
  }
  const logLevels: any[] = dbLogLevel.split(',');
  if (!logLevels.every((level) => allowedDbLogLevels.includes(level))) {
    throw new Error(`Invalid value of DB_LOG_LEVELS env variable: ${dbLogLevel}\n Valid values are: ${defaultLogLevels.join(',')} and must be separated by single comma\n`);
  }
  return logLevels;
};

const extractLogModuleFilterFromEnv = (): string[] | undefined => {
  // expected format: "path1,path2"
  const moduleFilter = process.env.LOG_MODULE_FILTER;
  if (!moduleFilter) {
    return undefined;
  }
  const modules: string[] = moduleFilter.split(',');
  return modules;
};

const extractLogPrefixFilterFromEnv = (): string[] | undefined => {
  // expected format: "PREFIX1,PREFIX2"
  const prefixFilter = process.env.LOG_PREFIX_FILTER;
  if (!prefixFilter) {
    return undefined;
  }
  const prefixes: string[] = prefixFilter.split(',');
  return prefixes;
};

if (!!process.env.LOG_LEVEL && !defaultLogLevels.includes(process.env.LOG_LEVEL)) {
  throw new Error(`Invalid log level: ${process.env.LOG_LEVEL}`);
}

if (!!process.env.HTTP_LOG_LEVEL && !defaultLogLevels.includes(process.env.HTTP_LOG_LEVEL)) {
  throw new Error(`Invalid log level: ${process.env.HTTP_LOG_LEVEL}`);
}

export const logLevel = process.env.LOG_LEVEL ?? 'info';
export const httpLogLevel = process.env.HTTP_LOG_LEVEL ?? 'warn';
export const dbLogLevels: DbLogLevel[] = extractDbLogLevelsFromEnv() ?? ['error'];
export const moduleFilter = extractLogModuleFilterFromEnv() ?? [];
export const prefixFilter = extractLogPrefixFilterFromEnv() ?? [];
