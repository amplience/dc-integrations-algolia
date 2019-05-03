import express = require("express");

export class DefaultErrorHandler {
  static handleError(
    err: any,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ): void {
    if (!err) {
      return next();
    }

    const statusCode = err.hasOwnProperty("statusCode") ? err.statusCode : 500;
    res.status(statusCode).send({ error: err.message });
  }
}
