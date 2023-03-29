import ms from "ms";
import { sign, verify as jwtVerify } from "jsonwebtoken";
import { GraphQLError } from "graphql";
import { JWT_SECRET, JWT_EXPIRATION_PERIOD } from "../env";

export const format = (token: string) =>
  `${token.slice(0, 3)}...${token.slice(-3)}`;

/** Generate a JWT token
 * If expiryDurationSeconds is null, the token will never expire
 * If expiryDurationSeconds is undefined, the token will expire after the default expiry period
 */
export const generate = (
  sessionId: string,
  expiryDurationSeconds?: number | null
) => {
  if (expiryDurationSeconds === null) {
    return sign({ sessionId }, JWT_SECRET);
  }
  const expiresIn =
    typeof expiryDurationSeconds !== "undefined"
      ? ms(expiryDurationSeconds * 1000)
      : JWT_EXPIRATION_PERIOD;
  return sign({ sessionId }, JWT_SECRET, { expiresIn });
};

export const getExpiryDate = (expiryDurationSeconds?: number | null) => {
  if (expiryDurationSeconds === null) {
    return null;
  }
  const expiresIn =
    typeof expiryDurationSeconds !== "undefined"
      ? expiryDurationSeconds * 1000
      : ms(JWT_EXPIRATION_PERIOD);
  return new Date(Date.now() + expiresIn);
};

export const verify = (token: string): { sessionId: string } =>
  jwtVerify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      throw new GraphQLError(
        err.name === "TokenExpiredError"
          ? "Token expired"
          : "Invalid authentication token",
        { extensions: { code: "AUTHENTICATION_TOKEN_ERROR" } }
      );
    }
    return decoded;
  }) as any;
