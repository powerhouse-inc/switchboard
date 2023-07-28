import { configureWunderGraphApplication, cors, EnvironmentVariable, introspect, templates } from '@wundergraph/sdk';
import server from './wundergraph.server';
import operations from './wundergraph.operations';

const switchboard = introspect.graphql({
	apiNamespace: 'switchboard',
	url: 'http://localhost:3001/graphql',
  headers: (builder) => {
    console.log('asldkfal;skdjf;lkasdkf;lasdf')
    return builder.addClientRequestHeader('Authorization', 'Authorization')},
});

// configureWunderGraph emits the configuration
configureWunderGraphApplication({
	apis: [switchboard],
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
						'http://localhost:3001',
						'http://localhost:3000',
				  ]
				: ['http://localhost:3001', 'http://localhost:3000', new EnvironmentVariable('WG_ALLOWED_ORIGIN')],
	},
	security: {
		enableGraphQLEndpoint: true,
	},
});
