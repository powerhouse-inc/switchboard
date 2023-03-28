![Open-source API Supporting a Thriving Ecosystem of (D)apps](./banner.png)

[![CI](https://github.com/makerdao-ses/switchboard-boilerplate/actions/workflows/ci.yaml/badge.svg)](https://github.com/makerdao-ses/switchboard-boilerplate/actions/workflows/ci.yaml)
[![#license AGPLv3](https://img.shields.io/badge/license-AGPLv3-purple?style=plastic)](https://www.gnu.org/licenses/agpl-3.0)

# Powerhouse Switchboard

Open-source API over the [document model](https://github.com/makerdao-ses/document-model-libs) made to be developer- and analyst-friendly.

![app](./.github/app.png)

## Project structure
- [`/api`](./api) directory contains the core logic that creates the API over the database
- [`/frontend`](./frontend) directory contains the frontend-related code

<<<<<<< HEAD
Please navigate to the respective directories to read concrete instructions on how to start them locally.
=======
We use TypeScript, JavaScript and Node 18 (LTS) to develop this project. Commands:
```sh
# Set the required environment variables
cp .env.development .env

# Install all required dependencies
npm i

# Run application in development mode
npm run dev

# Run application with extensive logging enabled (full ORM logging + app's logger has `debug` level on)
npm run debug

# Typechecking (via TypeScript / tsc)
npm run typecheck
>>>>>>> main

## Project-Requirements

To understand what is planned, you can read and ask questions here:
- Initial Requirements: https://github.com/makerdao-ses/switchboard-boilerplate/issues/3
- Document Model explanation: https://github.com/makerdao-ses/switchboard-boilerplate/issues/1

<<<<<<< HEAD
## Coding Setup
=======
### Logging configuration

The configuration is received from the `logger.config.ts` file at the root of the project. Adjust the file parameters to control the logger behaviour.

### Coding Setup
>>>>>>> main

To install the correct node version, we recommend that you use [nvm](https://github.com/nvm-sh/nvm). If you have `nvm` installed you can run:
```sh
nvm install
nvm use
```
to automatically use the correct node version. The version is detected from the [.nvmrc](./.nvmrc).

If you do not have a code editor setup, we recommend that you use [Visual Studio Code](https://code.visualstudio.com/) to get started. It is very beginner friendly and you can move on to something else (such as Sublime, vim, emacs, ...) down the road if you want to.
<<<<<<< HEAD
=======

Some environment variables are pre-configured for the development. You can copy them over to your `.env` file by running:

```sh
cp developer.env .env
```

### Environment variables

- `DATABASE_URL` (required): path to the database file.
- `JWT_SECRET` (required): server's jwt secret.
- `PORT` (optional, default: 3000): port on which the server will run.
- `AUTH_SIGNUP_ENABLED` (optional, default: `false`): if signing up mutation is allowed (i.e. user creation via endpoint is enabled)
- `JWT_EXPIRATION_PERIOD` (optional, default: `'7d'`): how soon the signed jwt token will expire.
- `DEBUG` (optional): if set, enables the different more explicit logging mode where debug levels are set to `debug` for the app's logger and `query` for db logger

### Project-Requirements

To understand bettwe that is planned, you can read and ask questions here:
- Initial Requirements: https://github.com/makerdao-ses/switchboard-boilerplate/issues/3
- Document Model explanation: https://github.com/makerdao-ses/switchboard-boilerplate/issues/1

This covers the current idea of what we strive to achieve in a first phase.


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
>>>>>>> main
