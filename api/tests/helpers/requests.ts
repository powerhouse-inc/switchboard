import { Client } from '../../generated';

export const USERNAME = 'usernameTest';
export const PASSWORD = 'passwordTest';

export const signUp = async (
  client: Client,
  username: string = USERNAME,
  password: string = PASSWORD,
) => client.mutation({
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
  password: string = PASSWORD,
) => client.mutation({
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

export const getMe = (client: Client) => client.query({
  me: {
    username: true,
    id: true,
  },
});
