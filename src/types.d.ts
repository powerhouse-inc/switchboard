export type JwtVerificationResult = { userId: string | null; error?: 'JwtExpired' | 'Unhandled' };
