import builder from 'gql-query-builder';

export const USERNAME = 'usernametest';
export const PASSWORD = 'passwordTest';

export const getSignUpMutation = (
  username: string = USERNAME,
  password: string = PASSWORD,
) => builder.mutation({
  operation: 'signUp',
  variables: {
    user: {
      value: {
        username,
        password,
      },
      type: 'UserNamePass',
      required: true,
    },
  },
  fields: ['session{id, referenceExpiryDate, isUserCreated}', 'token'],
});

export const signInMutation = builder.mutation({
  operation: 'signIn',
  variables: {
    user: {
      value: {
        username: USERNAME,
        password: PASSWORD,
      },
      type: 'UserNamePass',
      required: true,
    },
  },
  fields: ['session{id, referenceExpiryDate, isUserCreated}', 'token'],
});

export const meQuery = builder.query({
  operation: 'me',
  fields: ['id', 'username'],
});
