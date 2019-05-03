import { WebhookRequest } from '../dynamic-content/models/webhook-request';
import { HttpError } from './http-error.interface';

export class InvalidWebhookRequestError extends Error implements HttpError {
  public readonly statusCode = 202;
  constructor(webhook: WebhookRequest) {
    super(`Invalid Webhook: ${JSON.stringify(webhook)}`);
  }
}
