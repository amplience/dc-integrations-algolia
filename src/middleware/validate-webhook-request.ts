import { NextHandleFunction } from 'connect';
import { WebhookSignature } from 'dc-management-sdk-js';
import * as express from 'express';
import { BadRequestError } from '../errors/bad-request-error';

export default class ValidateWebhookRequest {
  public static validateHeaders(req: express.Request, res: express.Response, next: express.NextFunction): void {
    if (req.get('content-type') !== 'application/json') {
      return next(new BadRequestError());
    }
    return next();
  }

  public static expressJson(webhooksecret: string): NextHandleFunction {
    return express.json({
      type: (): boolean => true,
      verify: (req: express.Request, res: express.Response, buf: Buffer): void => {
        const suppliedSignature: string = req.get('X-Amplience-Webhook-Signature');
        const calculatedSignature: string = WebhookSignature.calculate(buf, webhooksecret);
        if (suppliedSignature !== calculatedSignature) {
          throw new Error('Webhook verification failed.');
        }
      }
    });
  }

  public static middleware(webhooksecret: string): NextHandleFunction[] {
    return [ValidateWebhookRequest.validateHeaders, ValidateWebhookRequest.expressJson(webhooksecret)];
  }
}
