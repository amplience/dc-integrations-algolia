import { HttpError } from './http-error.interface';

export class InvalidWebhookSecretError extends Error implements HttpError {
  public readonly statusCode = 202;
  public constructor(secret: string) {
    super(`Invalid Webhook Secret: ${secret}`);
  }
}
