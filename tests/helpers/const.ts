import builder from 'gql-query-builder';

export const USERNAME = 'usernameTest';
export const PASSWORD = 'passwordTest';

export const signUpMutation = builder.mutation({
  operation: 'signUp',
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
