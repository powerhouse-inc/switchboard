# Wundergraph service

The service to compose multiple graphql endpoints together. Documentation is of the underlying package is available under https://docs.wundergraph.com/. This service is intended to be run only in production to merge graphql endpoint produced by the `../api` service with [ecosystem-api](https://github.com/makerdao-ses/ecosystem-api)

## Quick start

1. Create env file with correct env variables (start with `cp example.env .env`)
2. Make sure both services that should be composed are running, e.g.:
   - Run `npm run dev` in `../api` directory of this repo
   - Set correct `ECOSYSTEM_GQL_ENDPOINT` env variable in the file created above
3. Run `npm run dev` inside `./wundergraph` directory
4. Interact with graphql endpoint of wundergraph running at `http://localhost:3002/graphql`
    - E.g.: run `npm run dev` in `../frontend` directory of the project to be able to interact with newly created endpoint (you will need to set playground to connect to `http://localhost:3002/graphql`)

## Environment variables

- `ECOSYSTEM_GQL_ENDPOINT` (required): URL of the graphql endpoint that needs to be migrated (in our case that should be `https://ecosystem-dashboard.herokuapp.com/graphql`, but for testing we can use any other graphql endpoint such as `https://countries.trevorblades.com/graphql`). Pre-requirements for the endpoint are:
   - Enabled graphql introspection
   - Appropriate CORS settings
- `SWITCHBOARD_GQL_ENDPOINT` (optional, default `http://localhost:3001/graphql`): URL of the switchboard graphql endpoint that is proxied transparently
- `ALLOWED_ORIGINS` (optional, default `http://localhost:3001,http://localhost:3000`)
