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
- `PORT` (optional, default: 3000): port on which the server will run
- `AUTH_SIGNUP_ENABLED` (optional, default: `false`): if signing up mutation is allowed (i.e. user creation via endpoint is enabled)
- `JWT_EXPIRATION_PERIOD` (optional, default: `'7d'`): how soon the signed jwt token will expire
- `DEBUG` (optional): if set, enables the different more explicit logging mode where debug levels are set to `debug` for the app's logger and `query` for db logger

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
            }
        }
        ```

    - Example response (that contains hex-encoded message)
        ```json
        {
            "data": {
                "createChallenge": {
                    "nonce": "6f4c7f7cd61a499290e68a2740957407",
                    "message": "0x6c6f63616c686f73742077616e747320796f7520746f207369676e20696e207769746820796f757220457468657265756d206163636f756e743a0a3078333139386235354434393732393346373333463236333137353563373636653131636535363866350a0a0a5552493a20687474703a2f2f6c6f63616c686f73743a333030300a56657273696f6e3a20310a436861696e2049443a20310a4e6f6e63653a2036663463376637636436316134393932393065363861323734303935373430370a4973737565642041743a20323032332d30362d32305431373a34353a35362e3435385a"
                }
            }
        }
        ```

2. Sign provided message
    - Either [using your metamask wallet](https://docs.metamask.io/wallet/how-to/use-siwe/)
        ```js
        // this should be executed at the browser console of the graphql playground
        await ethereum.request({
            method: 'personal_sign',
            params: [
                'paste_message_from_above',
                'paste_your_ethereum_address'
            ]
        });
        ```

    - Or using foundry command line tool called `cast` (note: you will be asked for your private key; for other auth methods, [read the cli docs](https://book.getfoundry.sh/reference/cast/cast-wallet-sign))
        ```sh
        $ cast wallet sign -i "message_from_above"
        ```

3. Provide signature back to the API to get usual JWT token back
    - Example request
        ```gql
        mutation {
            solveChallenge(
                nonce: "paste_nonce_from_above"
                signature: "paste_signature_generated_in_step_2"
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
    - Either sent as `Authorization: Bearer paste_your_token_from_above`
    - Or as `Authorization` cookie

## Health endpoint

Endpoint available at `/healthz` path. Provides response if api is currently running and prisma (orm) is able to execute queries.
