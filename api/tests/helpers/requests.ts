import builder from "gql-query-builder";
import { Client } from "../../generated";

export const USERNAME = "usernameTest";
export const PASSWORD = "passwordTest";

export const getSignUpMutation = (
  username: string = USERNAME,
  password: string = PASSWORD
) =>
  builder.mutation({
    operation: "signUp",
    variables: {
      user: {
        value: {
          username,
          password,
        },
        type: "UserNamePassInput",
        required: true,
      },
    },
    fields: ["session{id, referenceExpiryDate, isUserCreated}", "token"],
  });

export const signInMutation = builder.mutation({
  operation: "signIn",
  variables: {
    user: {
      value: {
        username: USERNAME,
        password: PASSWORD,
      },
      type: "UserNamePassInput",
      required: true,
    },
  },
  fields: ["session{id, referenceExpiryDate, isUserCreated}", "token"],
});

export const meQuery = builder.query({
  operation: "me",
  fields: ["id", "username"],
});

export const signUp = async (
  client: Client,
  username: string = USERNAME,
  password: string = PASSWORD
) =>
  await client.mutation({
    signUp: {
      token: true,
      session: {
        isUserCreated: true,
        id: true,
        referenceExpiryDate: true,
      },
      __args: {
        user: {
          username,
          password,
        },
      },
    },
  });

export const signIn = async (
  client: Client,
  username: string = USERNAME,
  password: string = PASSWORD
) =>
  await client.mutation({
    signIn: {
      token: true,
      session: {
        referenceExpiryDate: true,
        isUserCreated: true,
      },
      __args: {
        user: {
          username,
          password,
        },
      },
    },
  });

export const getMe = (client: Client) =>
  client.query({
    me: {
      username: true,
      id: true,
    },
  });
