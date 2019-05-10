import { HttpError } from './http-error.interface';

export class BadRequestError extends Error implements HttpError {
  public readonly statusCode = 400;
  public constructor() {
    super('Bad Request');
  }
}
