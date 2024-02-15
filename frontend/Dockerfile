# see https://docs.docker.com/engine/reference/builder/#understand-how-arg-and-from-interact
ARG NODE_VERSION=node:20.11.0

FROM $NODE_VERSION AS dependency-base

# create destination directory
RUN mkdir -p /app/frontend
WORKDIR /app/frontend

# copy the app, note .dockerignore
COPY frontend/package.json .
COPY frontend/package-lock.json .
COPY frontend/scripts ./scripts
RUN npm ci

FROM dependency-base AS production-base

# build will also take care of building
# if necessary
COPY frontend /app/frontend
COPY api /app/api
WORKDIR /app/api
RUN yarn install --frozen-lockfile
WORKDIR /app/frontend

# Set env vars before build
ARG API_BASE=""
ENV API_BASE=${API_BASE}
ARG API_GQL_ENDPOINT=/wundergraph/graphql
ENV API_GQL_ENDPOINT=${API_BASE}

RUN npm run build

FROM $NODE_VERSION AS production

COPY --from=production-base /app/frontend/.output /app/frontend/.output

# Service hostname
ENV NUXT_HOST=0.0.0.0

# Service version
ARG NUXT_APP_VERSION
ENV NUXT_APP_VERSION=${NUXT_APP_VERSION}

# Run in production mode
ENV NODE_ENV=production

# start the app
CMD [ "node", "/app/frontend/.output/server/index.mjs" ]
