import { HttpError } from './http-error.interface';
import { WebhookRequest } from '../dynamic-content/models/webhook-request';

export class InvalidWebhookRequestError extends Error implements HttpError {
  readonly statusCode = 202;
  constructor(webhook: WebhookRequest) {
    super(`Invalid Webhook: ${JSON.stringify(webhook)}`);
  }
}
