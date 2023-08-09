# Wundergraph service

Allows to unify or merge multiple apis and/or graphql endpoints together and expose them under the same api endpoint.
Documentation is available under https://docs.wundergraph.com/

## Quick start

1. Configure `wundergraph/.env` file. `example.env` is available as the template.
2. Make sure both services that should be running under wundergraph are started and running.
   E.g.:
   1. Run `npm run dev` in `api/` directory of this project to make the switchboard graphql available.
   2. Run `npm run dev` in the cloned directory of ecosystem.
3. Run `npm run dev` in `wundergraph/` directory.
4. (optional) Run `npm run dev` in `frontend/` directory of the project to be able to interact with gql through playground
5. interact with graphql endpoint of wundergraph that is running on `localhost:9991`

## Environment variables

- `ECOSYSTEM_GQL_ENDPOINT` (required): Link to the graphql endpoint that needs to be migrated (for example `https://countries.trevorblades.com/graphql`)
   - Please note that the underlying service need to set appropriate CORS settings
- `SWITCHBOARD_GQL_ENDPOINT` (optional, default `http://localhost:3001/graphql`): Link to the switchboard graphql endpoint
- `ALLOWED_ORIGINS` (optional, default `http://localhost:3001,http://localhost:3000`): Link to the switchboard graphql endpoint

## Example of the config

To unite multiple apis together the config could look like this:

```typescript
const ecosystem = introspect.graphql({ // define the first graphql endpoint
	apiNamespace: 'ecosystem', // namespace that wundergraph will use (1)
	url: ecosystemGqlEndpoint,
});

const switchboard = introspect.graphql({ // define the second graphql endpoint
	apiNamespace: '', // namespace that wundergraph will use (2)
	url: switchboardGqlEndpoint,
  headers: (builder) => builder.addClientRequestHeader('Authorization', 'Authorization')
});


configureWunderGraphApplication({
	apis: [switchboard, ecosystem],
    // ... rest of the code, look up docs to see other examples or full version of this one
```

This example would result into wundergraph's api endpoint:

1. exposing all the queries, mutations ... of ecosystem gql with prefix `ecosystem_`. I.e.
   if ecosystem's gql has query named `getUsers`, wundergraph would have the query name `ecosystem_getUsers`
2. exposing all the queries, mutations ... of switchboard gql with no prefix. I.e.
   if switchboard's gql has query named `getUsers`, wundergraph would have the same query name `getUsers`

Resulting into the possibility to query users from either service (switchboard or ecosystem)
via `ecosystem_getUsers` and `getUsers`

