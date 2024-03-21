FROM node:lts-alpine AS deps

WORKDIR /opt/app
COPY package.json pnpm-lock.yaml .
RUN npm install -g pnpm
RUN pnpm install

# Rebuild the source code only when needed
# This is where because may be the case that you would try
# to build the app based on some `X_TAG` in my case (Git commit hash)
# but the code hasn't changed.
FROM node:lts-alpine AS builder

ENV NODE_ENV=production
ARG NEXT_PUBLIC_SWITCHBOARD_GRAPHQL_HOST
ENV NEXT_PUBLIC_SWITCHBOARD_GRAPHQL_HOST=${NEXT_PUBLIC_SWITCHBOARD_GRAPHQL_HOST}
WORKDIR /opt/app
COPY . .
COPY --from=deps /opt/app/node_modules ./node_modules
RUN npm install -g pnpm
ARG BASE_PATH=undefined
ENV BASE_PATH=${BASE_PATH}
RUN pnpm build

# Production image, copy all the files and run next
FROM node:lts-alpine AS runner

ARG X_TAG
WORKDIR /opt/app
ENV NODE_ENV=production
ARG BASE_PATH=undefined
ENV BASE_PATH=${BASE_PATH}
EXPOSE 3000
COPY --from=builder /opt/app/next.config.mjs ./
COPY --from=builder /opt/app/public ./public
COPY --from=builder /opt/app/.next ./.next
COPY --from=builder /opt/app/node_modules ./node_modules
CMD ["node_modules/.bin/next", "start"]
