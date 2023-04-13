# see https://docs.docker.com/engine/reference/builder/#understand-how-arg-and-from-interact
ARG NODE_VERSION=node:16.14.2

FROM $NODE_VERSION AS dependency-base

# create destination directory
RUN mkdir -p /app/frontend
WORKDIR /app/frontend

# copy the app, note .dockerignore
COPY frontend/package.json .
COPY frontend/package-lock.json .
RUN npm ci

FROM dependency-base AS production-base

# build will also take care of building
# if necessary
COPY frontend /app/frontend
COPY api /app/api
WORKDIR /app/frontend
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
