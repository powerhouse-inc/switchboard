import { configureWunderGraphServer, EnvironmentVariable, LoggerLevel } from '@wundergraph/sdk/server';

export default configureWunderGraphServer(() => ({
  options: {
    listen: {
      host: new EnvironmentVariable('SERVER_HOST', '0.0.0.0'),
      port: new EnvironmentVariable('SERVER_PORT', '3003'),
    },
    logger: {
      level: new EnvironmentVariable<LoggerLevel>('SERVER_LOG_LEVEL', 'debug'),
    },
  },
  hooks: {
    queries: {},
    mutations: {},
  },
}));
