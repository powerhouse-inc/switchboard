export const getJwtSecret = (): string => {
  if (!process.env.JWT_SECRET) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('JWT_SECRET is not defined');
    }
  }
  return process.env.JWT_SECRET || 'dev';
};
