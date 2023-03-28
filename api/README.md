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

## Database

We use [Prisma ORM](prisma.io/) as an ORM for this project. It is installed when you run `npm i`. Here are some useful commands for development:
```sh
# Push the current database schema to the database. This will also automatically generate the prisma client
npx prisma db push

# Create the typescript database client from the `schema.prisma` file
npx prisma generate

# Get a live-view of the database, useful for development and testing
npx prisma studio
```
