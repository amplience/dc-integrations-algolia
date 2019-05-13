import { HttpError } from './http-error.interface';

export class AlgoliaSearchRequestError extends Error implements HttpError {
  public readonly statusCode = 202;
  public constructor(message: string) {
    super(message);
  }
}
