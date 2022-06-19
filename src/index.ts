import "reflect-metadata";
import { buildSchema } from "type-graphql";
import { ApolloServer } from "apollo-server-lambda";
import { GraphQLScalarType } from "graphql";
import { DateTimeResolver } from "graphql-scalars";
import { dbContext } from "./dbContext";
import { resolvers } from "../prisma/generated/type-graphql";

let apolloServer: ApolloServer = null;

async function bootstrap(event, context, callback) {
  if (!apolloServer) {
    const schema = await buildSchema({
      resolvers,
      scalarsMap: [{ type: GraphQLScalarType, scalar: DateTimeResolver }],
    });
    apolloServer = new ApolloServer({
      schema,
      context: (receivedContext) => ({
        ...receivedContext,
        ...dbContext,
      }),
    });
  }
  return apolloServer.createHandler({
    expressGetMiddlewareOptions: {
      cors: {
        origin: "https://getamped-dictionary.com",
        credentials: false,
      },
    },
  })(event, context, callback);
}

exports.handler = (event, context, callback) => {
  context.callbackWaitsForEmptyEventLoop = false;
  if (event.source === "serverless-plugin-warmup") {
    return "Lambda is warm!"
  }

  return bootstrap(event, context, callback);
};
