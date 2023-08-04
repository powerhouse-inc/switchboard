// wundergraph.config.ts
var import_sdk2 = require("@wundergraph/sdk");

// wundergraph.server.ts
var import_server = require("@wundergraph/sdk/server");
var wundergraph_server_default = (0, import_server.configureWunderGraphServer)(() => ({
  hooks: {
    queries: {
      Countries: {
        preResolve: async ({ operations }) => {
        }
      }
    },
    mutations: {}
  }
}));

// wundergraph.operations.ts
var import_sdk = require("@wundergraph/sdk");
var wundergraph_operations_default = (0, import_sdk.configureWunderGraphOperations)({
  operations: {
    defaultConfig: {
      authentication: {
        required: false
      }
    },
    queries: (config) => ({
      ...config,
      caching: {
        enable: false,
        staleWhileRevalidate: 60,
        maxAge: 60,
        public: true
      },
      liveQuery: {
        enable: true,
        pollingIntervalSeconds: 1
      }
    }),
    mutations: (config) => ({
      ...config
    }),
    subscriptions: (config) => ({
      ...config
    }),
    custom: {}
  }
});

// wundergraph.config.ts
var ecosystem = import_sdk2.introspect.graphql({
  apiNamespace: "ecosystem",
  url: "http://localhost:4000/graphql"
});
var switchboard = import_sdk2.introspect.graphql({
  apiNamespace: "asdf",
  url: process.env.SWITCHBOARD_URL || "http://localhost:3001/graphql",
  headers: (builder) => builder.addClientRequestHeader("Authorization", "Authorization")
});
(0, import_sdk2.configureWunderGraphApplication)({
  apis: [switchboard, ecosystem],
  server: wundergraph_server_default,
  operations: wundergraph_operations_default,
  generate: {
    codeGenerators: []
  },
  cors: {
    ...import_sdk2.cors.allowAll,
    allowedOrigins: process.env.NODE_ENV === "production" ? [
      "http://localhost:3000/",
      "http://localhost:3001/",
      "http://localhost:4000/"
    ] : ["http://localhost:3000/", "http://localhost:3001/", "http://localhost:4000/", new import_sdk2.EnvironmentVariable("WG_ALLOWED_ORIGIN")]
  },
  security: {
    enableGraphQLEndpoint: true
  }
});
//# sourceMappingURL=config.cjs.map
