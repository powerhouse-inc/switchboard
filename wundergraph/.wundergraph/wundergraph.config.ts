import { configureWunderGraphApplication, cors, EnvironmentVariable, introspect, templates } from '@wundergraph/sdk';
import server from './wundergraph.server';
import operations from './wundergraph.operations';

const ecosystem = introspect.graphql({
	apiNamespace: 'ecosystem',
	url: process.env.ECOSYSTEM_URL || 'https://countries.trevorblades.com/graphql',
});

const switchboard = introspect.graphql({
	apiNamespace: '',
	url: process.env.SWITCHBOARD_URL || 'http://localhost:3001/graphql',
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
				: ['http://localhost:3000/','http://localhost:3001/', new EnvironmentVariable('WG_ALLOWED_ORIGIN')],
	},
	security: {
		enableGraphQLEndpoint: true,
	},
});
