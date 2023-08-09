## Environment variables

- `ECOSYSTEM_GQL_ENDPOINT` (required): Link to the graphql endpoint that needs to be migrated (for example `https://countries.trevorblades.com/graphql`)
   - Please note that the underlying service need to set appropriate CORS settings
- `SWITCHBOARD_GQL_ENDPOINT` (optional, default `http://localhost:3001/graphql`): Link to the switchboard graphql endpoint
