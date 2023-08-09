import {
  configureWunderGraphApplication, cors, introspect,
} from '@wundergraph/sdk';
import dotenv from 'dotenv';
import server from './wundergraph.server';
import operations from './wundergraph.operations';

dotenv.config();
const ecosystemGqlEndpoint = process.env.ECOSYSTEM_GQL_ENDPOINT;
if (!ecosystemGqlEndpoint) {
  throw new Error('ECOSYSTEM_GQL_ENDPOINT environment variable is not set');
}
const switchboardGqlEndpoint = process.env.SWITCHBOARD_GQL_ENDPOINT || 'localhost:3001/graphql';
const allowedOrigins = (process.env.ALLOWED_ORIGINS || 'http://localhost:3001,http://localhost:3000').split(',');

const ecosystem = introspect.graphql({
  apiNamespace: 'ecosystem',
  url: ecosystemGqlEndpoint,
});

const switchboard = introspect.graphql({
  apiNamespace: '',
  url: switchboardGqlEndpoint,
  headers: (builder) => builder.addClientRequestHeader('Authorization', 'Authorization'),
});

// configureWunderGraph emits the configuration
configureWunderGraphApplication({
  apis: [switchboard, ecosystem],
  server,
  operations,
  generate: {
    codeGenerators: [],
  },
  cors: {
    ...cors.allowAll,
    allowedOrigins,
  },
  security: {
    enableGraphQLEndpoint: true,
  },
});
