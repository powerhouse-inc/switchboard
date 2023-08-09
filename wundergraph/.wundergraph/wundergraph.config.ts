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
		allowedOrigins:
			process.env.NODE_ENV === 'production'
				? [
						// change this before deploying to production to the actual domain where you're deploying your app
						'http://localhost:3000/',
						'http://localhost:3001/',
				  ]
				: ['http://localhost:3000/','http://localhost:3001/'],
	},
	security: {
		enableGraphQLEndpoint: true,
	},
});
