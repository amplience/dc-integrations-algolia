import { HttpError } from './http-error.interface';

export class InvalidWebhookSignatureError extends Error implements HttpError {
  public readonly statusCode = 400;
  public constructor() {
    super('Bad Request');
  }
}
