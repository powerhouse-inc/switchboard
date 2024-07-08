import { GraphQLError } from "graphql";

export type CustomErrorContent = {
  message: string,
  context?: { [key: string]: any }
};

export abstract class CustomError extends GraphQLError {
  abstract readonly statusCode: number;
  abstract readonly errors: CustomErrorContent[];
  abstract readonly logging: boolean;

  constructor(message: string, status: number = 200) {
    super(message, {
      extensions: {
        http: {
          status
        }
      }
    });

    // Only because we are extending a built in class
    Object.setPrototypeOf(this, CustomError.prototype);
  }
}
