import { CustomError } from "./CustomError";

export default class DocumentDriveError extends CustomError {
  private static readonly _statusCode = 400;
  private readonly _code: number;
  private readonly _logging: boolean;
  private readonly _context: { [key: string]: any };

  constructor(params?: { code?: number, message?: string, logging?: boolean, context?: { [key: string]: any } }) {
    const { code, message, logging } = params || {};

    super(message || "Bad request");
    this._code = code || DocumentDriveError._statusCode;
    this._logging = logging || false;
    this._context = params?.context || {};

    // Only because we are extending a built in class
    Object.setPrototypeOf(this, DocumentDriveError.prototype);
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
