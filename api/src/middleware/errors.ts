import { NextFunction, Request, Response } from 'express';
import { CustomError } from '../errors/CustomError';
import { getChildLogger } from '../logger';

const logger = getChildLogger({ msgPrefix: 'Generic Error Handler' });

export const errorHandler = (
  err: CustomError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const errorId = (res as { sentry?: string }).sentry;
  err.cause = err.cause || 'Unknown';
  logger.error(err, err.message, { errorId });
  res.status(err.statusCode ?? 500).send({ errors: err.message, errorId });
};
