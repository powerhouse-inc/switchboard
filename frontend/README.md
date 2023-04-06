# Powerhouse Switchboard Frontend

The UI part of the system that intends to provide user-friendly wrapper over the API in order to easily do common things: signin/signup, create API tokens, use graphql playground, explore data stored in the database.

## Development Setup

1. Install project dependencies via `npm install`
2. Start development server via `npm run dev`
3. View hot-reloaded UI on [http://localhost:3000](http://localhost:3000)

Please refer to the root readme to learn more about general development setup.

## Production

You can build application for production using `npm run build` and then locally preview production build via `npm run preview`.

## Health endpoint

Endpoint available at `/healthz` path. Provides response if frontend is currently running.

## Documentation page

One of the frontend's features is displaying the documentation about document model.
The documentation is provided to the service externally as raw typedoc output in markdown format.

To display the documentation on the frontend the provided data has to be processed and represented in the form of a single file.
This process goes as follows:

1. Put the documentation into the `/docs` directory
2. Run the script for generation of the single documentation file that frontend consumes.

```bash
$ npm run mkdocs
```

3. The documentation that is generated will end up at `./content/documentation/index.md` file.
