export const PORT = Number(process.env.PORT ?? '3000');
export const isDevelopment = process.env.NODE_ENV === 'development';
export const JWT_SECRET = process.env.JWT_SECRET
