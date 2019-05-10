import DefaultErrorHandler from './default-error-handler';
import * as mocks from 'node-mocks-http';
import * as express from 'express';
import { HttpError } from '../errors/http-error.interface';

const HttpErrorClass = class implements HttpError {
  public constructor(public readonly statusCode, public readonly message) {}
};

describe('default error handler tests', (): void => {
  it('should ignore non-errors', (): void => {
    const next: express.NextFunction = jest.fn();
    DefaultErrorHandler.handleError(undefined, mocks.createRequest(), mocks.createResponse(), next);
    expect(next).toBeCalledWith();
  });

  it('should handle an Error()', (): void => {
    const next: express.NextFunction = jest.fn();
    const res = mocks.createResponse();
    DefaultErrorHandler.handleError(new Error('error message'), mocks.createRequest(), res, next);
    expect(next).not.toBeCalledWith();
    expect(res._getStatusCode()).toEqual(500);
    expect(res._getData()).toEqual({ error: 'error message' });
  });

  it('should handle an HttpError()', (): void => {
    const next: express.NextFunction = jest.fn();
    const res = mocks.createResponse();

    DefaultErrorHandler.handleError(new HttpErrorClass(400, 'Bad Request'), mocks.createRequest(), res, next);
    expect(next).not.toBeCalledWith();
    expect(res._getStatusCode()).toEqual(400);
    expect(res._getData()).toEqual({ error: 'Bad Request' });
  });

  it('should handle an string exception', (): void => {
    const next: express.NextFunction = jest.fn();
    const res = mocks.createResponse();

    DefaultErrorHandler.handleError('error message', mocks.createRequest(), res, next);
    expect(next).not.toBeCalledWith();
    expect(res._getStatusCode()).toEqual(500);
    expect(res._getData()).toEqual({ error: 'error message' });
  });
});
