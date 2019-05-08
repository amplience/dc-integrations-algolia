import { HttpError } from './http-error.interface';

export class DynamicContentRequestError extends Error implements HttpError {
  public readonly statusCode = 500;
  public constructor(message: string) {
    super(message);
  }
}
