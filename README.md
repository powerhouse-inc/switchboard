![Open-source API Supporting a Thriving Ecosystem of (D)apps](./banner.png)

[![CI](https://github.com/makerdao-ses/switchboard-boilerplate/actions/workflows/ci.yaml/badge.svg)](https://github.com/makerdao-ses/switchboard-boilerplate/actions/workflows/ci.yaml)
[![#license AGPLv3](https://img.shields.io/badge/license-AGPLv3-purple?style=plastic)](https://www.gnu.org/licenses/agpl-3.0)

# Powerhouse Switchboard

Open-source API over database models made to be developer- and analyst-friendly.

![app](./.github/app.png)

## Development

We use TypeScript, JavaScript and Node 18 (LTS) to develop this project. Commands:
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

## Environment variables:

- `DB_LOG_LEVELS` (optional, default: `info`): Controls the logging level which is used to log the application internal logic. Allowed values are `trace`, `debug`, `info`, `warn`, `error`, `fatal`, `silent`
- `HTTP_LOG_LEVEL` (optional, default: `warn`): Contols the logging level for the logger that is embedded into express-api (resolver endpoints). Allowed values are `trace`, `debug`, `info`, `warn`, `error`, `fatal`, `silent`
- `DB_LOG_LEVELS` (optional, default: `info,warn,error,query`): Controls the logging levels that are printed out by prisma. Must be single string with comma-separated values. Allowed values are: `info` `warn` `error` `query`

### Coding Setup

To install the correct node version, we recommend that you use [nvm](https://github.com/nvm-sh/nvm). If you have `nvm` installed you can run:
```sh
nvm install
nvm use
```
to automatically use the correct node version. The version is detected from the [.nvmrc](./.nvmrc).

If you do not have a code editor setup, we recommend that you use [Visual Studio Code](https://code.visualstudio.com/) to get started. It is very beginner friendly and you can move on to something else (such as Sublime, vim, emacs, ...) down the road if you want to.

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
