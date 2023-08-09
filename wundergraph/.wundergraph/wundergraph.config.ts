import { configureWunderGraphApplication, cors, EnvironmentVariable, introspect, templates } from '@wundergraph/sdk';
import server from './wundergraph.server';
import operations from './wundergraph.operations';
import dotenv from 'dotenv';

dotenv.config();
if (!process.env.ECOSYSTEM_URL) {
  throw new Error('ECOSYSTEM_URL environment variable is not set');
}
if (!process.env.SWITCHBOARD_URL) {
  throw new Error('SWITCHBOARD_URL environment variable is not set');
}
if (!process.env.ALLOWED_ORIGINS) {
  throw new Error('ALLOWED_ORIGINS environment variable is not set');
}
const allowedOrigins = process.env.ALLOWED_ORIGINS.split(',');

const ecosystem = introspect.graphql({
	apiNamespace: 'ecosystem',
	url: process.env.ECOSYSTEM_URL,
});

const switchboard = introspect.graphql({
	apiNamespace: '',
	url: process.env.SWITCHBOARD_URL,
  headers: (builder) => builder.addClientRequestHeader('Authorization', 'Authorization')
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
		allowedOrigins
	},
	security: {
		enableGraphQLEndpoint: true,
	},
});
