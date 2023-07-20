# Powerhouse Switchboard Frontend

The UI part of the system that intends to provide user-friendly wrapper over the API in order to easily do common things: signin/signup, create API tokens, use graphql playground, explore data stored in the database.

## Development Setup

0. `node -v` to check that your Node is LTS (currently version 18.*)
1. Set up _required_ environment variables [outlined below](#environment-variables) (if there any)
2. `npm install` to install dependencies
4. `npm run dev` to run application in development mode (make sure api service is already running)
5. View hot-reloaded UI on [http://localhost:3000](http://localhost:3000)

Please refer to the root readme to learn more about general development setup.

### Environment variables

- `API_BASE` (optional, default `http://localhost:3001`): relative path or the url under which `api` service is running. For example, if the `api` service is running on port 4000, the value should be `http://localhost:4000`. However, if the `api` is sharing the origin with the `frontend` service via reverse-proxy, providing relative path is enough (e.g.: `/backend`)

## Production

You can build application for production using `npm run build` and then locally preview production build via `npm run preview`.

## Health endpoint

Endpoint available at `/healthz` path. Provides response if frontend is currently running.

## Documentation page

One of the frontend's features is to display documentation about document model package. The documentation is generated using `scripts/generateDocs.ts` script from the `@acaldas/document-model-libs` npm package installed by the API service. Meaning that whenever the API updates the `@acaldas/document-model-libs` package, the documentation will be automatcially updated during build (before `npm run build`). To run the generation manually:

1. `(cd ../api && npm install)` to install api dependencies including `@acaldas/document-model-libs` package
2. `npm install` to install frontend dependencies
3. Generate documentation file that will be served by the frontend using `npm run generateDocs`
4. Start frontend via `npm run dev` (see [Development Setup](#development-setup) section above)
5. Open http://localhost:3000/documentation
