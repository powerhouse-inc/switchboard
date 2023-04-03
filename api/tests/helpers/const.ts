import builder from 'gql-query-builder';

export const USERNAME = 'usernameTest';
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
      type: 'UserNamePassInput',
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
      type: 'UserNamePassInput',
      required: true,
    },
  },
  fields: ['session{id, referenceExpiryDate, isUserCreated}', 'token'],
});

export const meQuery = builder.query({
  operation: 'me',
  fields: ['id', 'username'],
});
