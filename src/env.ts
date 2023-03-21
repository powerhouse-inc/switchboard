export const PORT = Number(process.env.PORT ?? '3000');
export const isDevelopment = process.env.NODE_ENV === 'development';

export const logLevel = process.env.LOG_LEVEL ?? 'info';
export const httpLogLevel = process.env.HTTP_LOG_LEVEL ?? 'warn';
