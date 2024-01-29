import type { Server } from "http";
import { createServer as createHttpServer } from "http";
import type express from "express";
import { ApolloServerPlugin, ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@apollo/server/express4";
import { ApolloServerPluginLandingPageDisabled } from "@apollo/server/plugin/disabled";
import bodyParser from "body-parser";
import cookierParser from "cookie-parser";
import cors from "cors";
import { PORT } from "../env";
import { schemaWithMiddleware } from "./schema";
import { Context, createContext } from "./context";
import { getChildLogger } from "../logger";

const logger = getChildLogger({ msgPrefix: "SERVER" });

function loggerPlugin(): ApolloServerPlugin<Context> {
  return {
    async requestDidStart() {
      return {
        async didEncounterErrors(c) {
          c.errors?.forEach((e) => {
            c.contextValue.apolloLogger.error({ error: e }, e.message);
          });
        },
      };
    },
  };
}

const createApolloServer = (): ApolloServer<Context> =>
  new ApolloServer<Context>({
    schema: schemaWithMiddleware,
    introspection: true,
    plugins: [ApolloServerPluginLandingPageDisabled(), loggerPlugin()],
  });

export const startServer = async (
  app: express.Application
): Promise<Server> => {
  logger.debug("Starting server");
  const httpServer = createHttpServer(app);
  const apollo = createApolloServer();

  await apollo.start();
  app.use(
    "/graphql",
    cors<cors.CorsRequest>(),
    cookierParser(undefined, { decode: (value: string) => value }),
    bodyParser.json(),
    expressMiddleware(apollo, {
      context: async (params) => createContext(params),
    })
  );

  app.use(
    "/:driveId",
    cors<cors.CorsRequest>(),
    cookierParser(undefined, { decode: (value: string) => value }),
    bodyParser.json(),
    expressMiddleware(apollo, {
      context: async (params) => createContext(params),
    })
  );

  return httpServer.listen({ port: PORT }, () => {
    logger.info(`Running on ${PORT}`);
  });
};
