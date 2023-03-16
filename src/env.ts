export const PORT = Number(process.env.PORT ?? '3000');
export const isDevelopment = process.env.NODE_ENV === 'development';

const defaultLogLevels = ['trace', 'debug', 'info', 'warn', 'error', 'fatal', 'silent'];

if (!!process.env.LOG_LEVEL && !defaultLogLevels.includes(process.env.LOG_LEVEL)) {
  throw new Error(`Invalid log level: ${process.env.LOG_LEVEL}`);
}

if (!!process.env.HTTP_LOG_LEVEL && !defaultLogLevels.includes(process.env.HTTP_LOG_LEVEL)) {
  throw new Error(`Invalid log level: ${process.env.HTTP_LOG_LEVEL}`);
}

export const logLevel = process.env.LOG_LEVEL ?? 'info';
export const httpLogLevel = process.env.HTTP_LOG_LEVEL ?? 'warn';
