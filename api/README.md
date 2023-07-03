# Switchboard API

The core of the system that wraps around the [business logic](https://github.com/makerdao-ses/document-model-libs) developed in a separate repository.

## Development

We use TypeScript and Node 18 (LTS) to develop this project. Commands:
```sh
# Set the required environment variables
cp .env.development .env

# Install all required dependencies
npm i

# Run application in development mode
npm run dev

# Typechecking (via TypeScript / tsc)
npm run typecheck

# Linting (via eslint)
npm run lint

# Testing via vitest
npm run test
```

### Environment variables

Some environment variables are pre-configured for the development. You can copy them over to your `.env` file by running `cp developer.env .env`

- `DATABASE_URL` (required): path to the database file
- `JWT_SECRET` (required): server's jwt secret
- `PORT` (optional, default `3000`): port on which the server will run
- `API_ORIGIN` (optional, default `http://0.0.0.0:${PORT}`): the URL at which the API is running. it's important to provide this variable in production since it influences the message signed during authorization
- `AUTH_SIGNUP_ENABLED` (optional, default: `false`): if signing up is allowed. In case it's not set, new users _cannot_ be created, but old users _can_ still sign in
- `JWT_EXPIRATION_PERIOD` (optional, default: `'7d'`): how soon JWT token will expire
- `DEBUG` (optional, default not set): if set, enables more explicit logging mode where debug levels are set to `debug` for the app's logger and `query` for db logger

### Database

We use [Prisma ORM](prisma.io/) as an ORM for this project. It is installed when you run `npm i`. Here are some useful commands for development:
```sh
# Push the current database schema to the database. This will also automatically generate the prisma client
npx prisma db push

# Create the typescript database client from the `schema.prisma` file
npx prisma generate

# Get a live-view of the database, useful for development and testing
npx prisma studio
```

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
