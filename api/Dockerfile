# see https://docs.docker.com/engine/reference/builder/#understand-how-arg-and-from-interact
ARG NODE_VERSION=node:16.14.2

FROM $NODE_VERSION AS dependency-base
ENV PORT=$PORT
ENV DATABASE_URL=$DATABASE_URL
ENV JWT_SECRET=$JWT_SECRET
ENV AUTH_SIGNUP_ENABLED=$AUTH_SIGNUP_ENABLED
ENV JWT_EXPIRATION_PERIOD_SECONDS=$JWT_EXPIRATION_PERIOD_SECONDS

# create destination directory
RUN mkdir -p /app
WORKDIR /app

# copy the app, note .dockerignore
COPY package.json .
COPY yarn.lock .
COPY Procfile .
COPY heroku.yml .
RUN yarn install --frozen-lockfile

FROM dependency-base AS production

COPY . .

# Run in production mode
ENV NODE_ENV=production
RUN sed --in-place 's/sqlite/postgresql/g' ./prisma/schema.prisma
RUN npx prisma generate

# initialize db and start the app
RUN useradd -m myuser
USER myuser
CMD yarn start
