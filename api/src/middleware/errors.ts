import { NextFunction, Request, Response } from "express";
import { getChildLogger } from "../logger";
import { CustomError } from "../errors/CustomError";

const logger = getChildLogger({ msgPrefix: 'Generic Error Handler', });

export const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
  err.cause = err.cause || 'Unknown';
  logger.error({
    msg: err.message,
  });

  console.log("TEST TEST TEST")
  res.status(500).send({ errors: err.message });
};
