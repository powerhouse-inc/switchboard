import builder from 'gql-query-builder';

export const signUpMutation = builder.mutation({
  operation: 'signUp',
  variables: {
    user: {
      value: {
        username: 'asdf',
        password: 'asdf',
      },
      type: 'UserNamePass',
      required: true,
    },
  },
  fields: ['session{id, referenceExpiryDate}', 'token'],
});

export const signInMutation = builder.mutation({
  operation: 'signIn',
  variables: {
    user: {
      value: {
        username: 'asdf',
        password: 'asdf',
      },
      type: 'UserNamePass',
      required: true,
    },
  },
  fields: ['session{id, referenceExpiryDate}', 'token'],
});
