![Open-source API Supporting a Thriving Ecosystem of (D)apps](./.github/banner.png)

[![CI](https://github.com/makerdao-ses/switchboard-boilerplate/actions/workflows/ci.yaml/badge.svg)](https://github.com/makerdao-ses/switchboard-boilerplate/actions/workflows/ci.yaml)
[![#license AGPLv3](https://img.shields.io/badge/license-AGPLv3-purple?style=plastic)](https://www.gnu.org/licenses/agpl-3.0)

# Powerhouse Switchboard

Open-source API over the [document model](https://github.com/makerdao-ses/document-model-libs) made to be developer- and analyst-friendly.

![app](./.github/app.png)

## Project structure
- [`/api`](./api) directory contains the core logic that creates the API over the database
- [`/frontend`](./frontend) directory contains the frontend-related code

Please navigate to the respective directories to read concrete instructions on how to start them locally.

## Project-Requirements

To understand what is planned, you can read and ask questions here:
- Initial Requirements: https://github.com/makerdao-ses/switchboard-boilerplate/issues/3
- Document Model explanation: https://github.com/makerdao-ses/switchboard-boilerplate/issues/1

## Coding Setup

To install the correct node version, we recommend that you use [nvm](https://github.com/nvm-sh/nvm). If you have `nvm` installed you can run:
```sh
nvm install
nvm use
```
to automatically use the correct node version. The version is detected from the [.nvmrc](./.nvmrc).

If you do not have a code editor setup, we recommend that you use [Visual Studio Code](https://code.visualstudio.com/) to get started. It is very beginner friendly and you can move on to something else (such as Sublime, vim, emacs, ...) down the road if you want to.
