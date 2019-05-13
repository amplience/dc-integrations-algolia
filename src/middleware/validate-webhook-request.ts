import { NextHandleFunction } from 'connect';
import { WebhookSignature } from 'dc-management-sdk-js';
import * as express from 'express';
import { BadRequestError } from '../errors/bad-request-error';
import * as debug from 'debug';
import { InvalidWebhookSecretError } from '../errors/invalid-webhook-secret-error';

const log = debug('dc-integrations-algolia:validate-webhook-request');

export const AMPLIENCE_WEBHOOK_SIGNATURE_HEADER = 'X-Amplience-Webhook-Signature';

export default class ValidateWebhookRequest {
  public static validateHeaders(req: express.Request, res: express.Response, next: express.NextFunction): void {
    if (req.get('content-type') !== 'application/json') {
      log('Received a invalid HTTP request - Invalid/missing Content-Type or invalid body');
      return next(new BadRequestError());
    }
    log('Received a valid HTTP request');
    return next();
  }

  public static expressJson(webhooksecret: string): NextHandleFunction {
    return express.json({
      type: (): boolean => true,
      verify: (req: express.Request, res: express.Response, buf: Buffer): void => {
        const suppliedSignature: string = req.get(AMPLIENCE_WEBHOOK_SIGNATURE_HEADER);
        const calculatedSignature: string = WebhookSignature.calculate(buf, webhooksecret);
        if (suppliedSignature !== calculatedSignature) {
          log('Invalid webhook signature - Please check the your webhook secret');
          throw new InvalidWebhookSecretError(webhooksecret);
        }
        log('Validated webhook signature');
      }
    });
  }

  public static middleware(webhooksecret: string): NextHandleFunction[] {
    return [ValidateWebhookRequest.validateHeaders, ValidateWebhookRequest.expressJson(webhooksecret)];
  }
}
