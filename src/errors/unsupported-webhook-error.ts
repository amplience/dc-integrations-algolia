import { WebhookRequest } from '../dynamic-content/models/webhook-request';
import { HttpError } from './http-error.interface';

export class UnsupportedWebhookError extends Error implements HttpError {
  // ACCEPTED (202) - this means this error will not be retried
  public readonly statusCode = 202;

  constructor(webhook: WebhookRequest) {
    super(`Unsupported webhook "${webhook.name}"`);
  }
}
