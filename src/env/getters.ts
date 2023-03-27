import ms from 'ms';

export const getJwtSecret = (): string => {
  if (!process.env.JWT_SECRET) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('JWT_SECRET is not defined');
    }
  }
  return process.env.JWT_SECRET || 'dev';
};

export const getJwtExpirationPeriod = (expiration?: string): string => {
  if (!expiration) {
    return '7d';
  }
  const expirationSeconds = Number(process.env.JWT_EXPIRATION_PERIOD_SECONDS);
  if (Number.isNaN(expirationSeconds)) {
    throw new Error('JWT_EXPIRATION_PERIOD_SECONDS must be a number');
  }
  // https://www.npmjs.com/package/jsonwebtoken for `expiresIn` format
  return ms(expirationSeconds * 1000);
};
