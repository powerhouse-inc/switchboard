import { rule, shield } from "graphql-shield";
import { ensureAuthenticated } from "../utils/auth";

const rules = {
  isAuthenticatedUser: rule()((_, __, { authVerificationResult }) =>
    ensureAuthenticated(authVerificationResult)
  ),
};

export const permissionsAuth = shield(
  {
    Query: {
      me: rules.isAuthenticatedUser,
    },
  },
  {
    allowExternalErrors: process.env.NODE_ENV !== "production",
  }
);
