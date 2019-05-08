import { NextHandleFunction } from 'connect';
import { WebhookSignature } from 'dc-management-sdk-js';
import * as express from 'express';

export default class ValidateWebhookSignature {
  public static middleware(webhooksecret): NextHandleFunction {
    return express.json({
      type: () => true,
      verify: (req: express.Request, res: express.Response, buf: Buffer, encoding: string) => {
        const suppliedSignature: string = req.get('X-Amplience-Webhook-Signature');
        const calculatedSignature: string = WebhookSignature.calculate(buf, webhooksecret);
        if (suppliedSignature !== calculatedSignature) {
          throw new Error('Webhook verification failed.');
        }
      }
    });
  }
}
