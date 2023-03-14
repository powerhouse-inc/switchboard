export type SuccessfulAuthentication = { userId: string };
export type UnsuccessfulAuthentication = { error: 'JwtExpired' | 'Unhandled' };
export type JwtVerificationResult = SuccessfulAuthentication | UnsuccessfulAuthentication;
