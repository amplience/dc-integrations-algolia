import express = require('express');
import { HttpError } from '../errors/http-error.interface';

export class DefaultErrorHandler {
  public static handleError(
    err: Error & HttpError,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ): void {
    if (!err) {
      return next();
    }

    const statusCode = err.hasOwnProperty('statusCode') ? err.statusCode : 500;
    res.status(statusCode).send({ error: err.message });
  }
}
