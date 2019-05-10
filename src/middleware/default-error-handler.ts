import express = require('express');
import { HttpError } from '../errors/http-error.interface';

export default class DefaultErrorHandler {
  public static handleError(
    err: Error | HttpError | string,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ): void {
    if (!err) {
      return next();
    }

    const statusCode = err.hasOwnProperty('statusCode') ? err['statusCode'] : 500;
    const message = err.hasOwnProperty('message') ? err['message'] : err;
    res.status(statusCode).send({ error: message });
  }
}
