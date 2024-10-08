# see https://docs.docker.com/engine/reference/builder/#understand-how-arg-and-from-interact
ARG NODE_VERSION=node:20.11.0

FROM $NODE_VERSION AS dependency-base

# create destination directory
RUN mkdir -p /app
WORKDIR /app

# copy the app, note .dockerignore
COPY package.json .
COPY pnpm-lock.yaml .
ENV NODE_ENV=production
RUN npm install -g pnpm
RUN pnpm install

FROM dependency-base AS production

COPY . .

ENV NODE_ENV=production
RUN pnpm prisma generate
RUN pnpm build
ENV PORT=3000

CMD pnpm prisma db push && pnpm start

HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 CMD curl -f http://localhost:3000/healthz || exit 1
