import { CustomError } from './CustomError';

export default class ForbiddenError extends CustomError {
  private static readonly statusCode = 403;

  private readonly _code: number;

  private readonly _logging: boolean;

  private readonly _context: { [key: string]: any };

  constructor(params?: {
    code?: number;
    message?: string;
    logging?: boolean;
    context?: { [key: string]: any };
  }) {
    const { code, message, logging } = params || {};

    super(message || 'Bad request', 400);
    this._code = code || ForbiddenError.statusCode;
    this._logging = logging || false;
    this._context = params?.context || {};

    // Only because we are extending a built in class
    Object.setPrototypeOf(this, ForbiddenError.prototype);
  }

  get errors() {
    return [{ message: this.message, context: this._context }];
  }

  get statusCode() {
    return this._code;
  }

  get logging() {
    return this._logging;
  }
}
