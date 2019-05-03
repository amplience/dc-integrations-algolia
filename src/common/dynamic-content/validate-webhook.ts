import {WebhookSignature} from "dc-management-sdk-js";
import express = require("express");

export class ValidateWebhook {
  static verifySignature(req: express.Request, res: express.Response, next: express.NextFunction) {
    if (!process.env.WEBHOOK_SECRET) {
      res.status(401).send();
      throw new Error('WEBHOOK_SECRET not defined in environment');
    }

    const suppliedSignature: string = req.get('X-Amplience-Webhook-Signature');
    const calculatedSignature: string = WebhookSignature.calculate(req.rawBody, process.env.WEBHOOK_SECRET);
    if (suppliedSignature !== calculatedSignature) {
      return res.status(401).send();
    }
    next();
  }
}
