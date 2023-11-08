# Switchboard API

The core of the system that wraps around the [business logic](https://github.com/makerdao-ses/document-model-libs) developed in a separate repository.

## Development Setup

0. `node -v` to check that your Node is LTS (currently version 18.*)
1. Set up required environment variables [outlined below](#environment-variables)
    - `cp developer.env .env` to copy default values
2. `npm install` to install dependencies
3. `npx prisma db push` to create/update database structure
4. `npm run dev` to run application in development mode
5. Open `http://localhost:3001` to see graphql explorer
  - Set server to `http://localhost:3001/graphql`
  - Execute `query { coreUnits { id } }` to see a result

Other commands include:
- `npm run typecheck` for typechecking
- `npm run lint` for linting
- `npm run test` for testing via vitest

### Environment variables

Note: you can set environment variables directly or define them in the `api/.env` file. Default values for developement can be found in `developer.env` file, to copy them, run: `cp developer.env .env`

- `DATABASE_URL` (required): path to the database file
    - Note: in order to use postgres, one have to 1) provide valid postgres url here 2) edit the primsa schema (eg: `sed --in-place 's/sqlite/postgresql/g' ../prisma/schema.prisma`)
- `JWT_SECRET` (required): server's jwt secret
- `PORT` (optional, default `3001`): port on which the server will run
- `API_ORIGIN` (optional, default `http://0.0.0.0:${PORT}`): the URL at which the API is running. it's important to provide this variable in production since it influences the message signed during authorization
- `API_GQL_ENDPOINT` (optional, default `${API_ORIGIN}/graphql`): the graphql URL which will be used in the graphql playground as a server address
- `AUTH_SIGNUP_ENABLED` (optional, default: `false`): if signing up is allowed. In case it's not set, new users _cannot_ be created, but old users _can_ still sign in
- `JWT_EXPIRATION_PERIOD` (optional, default: `'7d'`): how soon JWT token will expire
- `DEBUG` (optional, default not set): if set, enables more explicit logging mode where debug levels are set to `debug` for the app's logger and `query` for db logger

### Database

We use [Prisma ORM](prisma.io/) as an ORM for this project. It is installed when you run `npm i`. Here are some useful commands for development:

- `npx prisma db push` – push the current database schema to the database. This will also automatically generate the prisma client
- `npx prisma generate` - create the typescript database client from the `schema.prisma` file
- `npx prisma studio` – get a live-view of the database, useful for development and testing

Note: we use sqlite in this project during development, but automatically switch it to postgres inside docker. In order to use postges, one have to 1) set `DATABASE_URL` to be valid postgres url 2) change `provider = "sqlite"` to `provider = "postgresql"` inside [prisma schema](./prisma/schema.prisma)

### Logging configuration

The configuration is received from the `logger.config.ts` file at the root of the project. Adjust the file parameters to control the logger behaviour.

## Authentication

The API authentication is implemented using "Sign-In with Ethereum" standard described in [EIP-4361](https://eips.ethereum.org/EIPS/eip-4361). Basically, in order to get a usual JWT token, one have to sign a message provided by the API using their etherium wallet. In practice it means:

1. Create challenge via executing `createChallenge` graphql mutation
    - Example request (that have to contain your public etherium address)
        ```gql
        mutation {
            createChallenge(
                address: "paste_your_ethereum_address"
            ) {
                nonce
                message
                hex
            }
        }
        ```

    - Example response (that contains hex-encoded message)
        ```json
        {
            "data": {
                "createChallenge": {
                    "nonce": "6f4c7f7cd61a499290e68a2740957407",
                    "message": "example.com wants you to sign in with your Ethereum account...",
                    "hex": "0x302e302e302e302077616e74732029..."
                }
            }
        }
        ```
        Where `hex` is just hex-encoded `message` that actually needs to be signed

2. Sign provided message
    - Either [using your metamask wallet](https://docs.metamask.io/wallet/how-to/use-siwe/)
        ```js
        // those commands should be executed in the browser console of the graphql playground
        const addresses = await provider.send('eth_requestAccounts', [])
        await ethereum.request({
            method: 'personal_sign',
            params: [
                'paste_hex_from_the_above',
                addresses[0]
            ]
        });
        ```

    - Or using foundry command line tool called `cast` (note: you will be asked for your private key; for other auth methods, [read the cli docs](https://book.getfoundry.sh/reference/cast/cast-wallet-sign))
        ```sh
        $ cast wallet sign -i "hex_from_the_above"
        ```

3. Provide signature back to the API to get usual JWT token back
    - Example request
        ```gql
        mutation {
            solveChallenge(
                nonce: "paste_nonce_from_step_1"
                signature: "paste_signature_from_step_2"
            ) {
                token
            }
        }
        ```

    - Example response
        ```json
        {
            "data": {
                "solveChallenge": {
                    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzZXNzaW9uSWQiOiI5ZGM1NjI3Mi1hMjBjLTRmM2YtYjM5MC1kZDc2NjE1NTA0YTYiLCJpYXQiOjE2ODczMzc2MDEsImV4cCI6MTY4Nzk0MjQwMX0.z1lJlKXnCbcex59JkU9j7hfRGhR2EBrnUE8phwPN7C0"
                }
            }
        }
        ```

4. Use provided JWT token to make subsequent API requests
    - Either sent as `Authorization: Bearer paste_token_from_step_3`
    - Or set as `Authorization` cookie
    - Example request
        ```gql
        query {
            me {
                address
            }
        }
        ```

## Health endpoint

Endpoint available at `/healthz` path. Provides response if api is currently running and prisma (orm) is able to execute queries.

## Adding new modules

The api can be extended via modules developed separately and packaged via npm. The example of this approach is the [`module-example`](../module-example) folder found in the root of the project and installed via npm into the `api`.

In order to create a new external module, one have to:

- Create npm package which exports a single function `setup` ([see example](../module-example/index.ts))
    - `setup` function would receive a single parameter: `prisma` – the [prisma client](https://www.prisma.io/docs/concepts/components/prisma-client#3-importing-prisma-client)
    - `setup` function should return an object with 2 keys `{ extendedPrisma, resolvers }`
        - `extendedPrisma` (optional) – an object with extended prisma client (see provided example)
            - In case you want to not only query existing tables, but extend prisma client with new functions, you can use [prisma $extensions](https://www.prisma.io/docs/concepts/components/prisma-client/client-extensions). This will allow other packages or core modules to use those new functions. Note that currently prisma do not support creating complete new tables via JS api, only adding models (functional extentions over the available methods)
            - The prisma returned here will be later passed to the resolvers
        - `resolvers` (optional) – an object with graphql types and resolvers defined via [`nexus`](https://www.npmjs.com/package/nexus). This allows you to define new graphq queries or mutations
            - Note that `resolve` function inside the resolver will receive custom `ctx` object as a third parameter (i.e.: `(_root, args, ctx: Context)`). It is an object that provides (more info can be found in [`context.ts`](./src/graphql/context.ts)):
                - `ctx.request` – pure `express` request object
                - `ctx.prisma` – fully-extended (by all other packages) prisma client
                - `ctx.getSession()` – function to get user session (or throw 401 error if it's not present). This function have to be called in case your resolver should only be accessible by registered users
- Install created package into the `api` project (i.e.: run `npm install package-name` or `npm install ../package-folder` it the package is local)
- Add default export from the created package into the `importedModules` array (inside [`importedModules.ts`](./src/importedModules.ts))
- Modify `preinstall` script found in `./api/package.json` if your package does not ship pre-built js files
- Start `api` as suggested above in the `Development Setup` section
- Open graphql playground found at http://localhost:3001/
    - Make sure your endpoint is set to query `http://localhost:3001/graphql`
- Run a test query. In case of `module-example` that would be:
    ```gql
    {
        countUsers(message: "test") {
            message
            count
        }
    }
    ```
- In case of `module-example`, this should result in:
    ```json
    {
        "data": {
            "countUsers": {
                "message": "test",
                "count": 1
            }
        }
    }
    ```
