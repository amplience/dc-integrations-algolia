import * as express from "express";
import { plainToClass } from "class-transformer";
import * as debug from "debug";
import { WebhookRequest } from "../dynamic-content/models/webhook-request";
import { UnsupportedWebhookError } from "../errors/unsupported-webhook-error";
import { validate } from "class-validator";
import { InvalidWebhookRequestError } from "../errors/invalid-webhook-request-error";
const log = debug("dc-snasphot-published-webhook");

export class DCSnapshotPublishedWebhook {
  static readonly SUPPORTED_WEBHOOK_NAME = "dynamic-content.snapshot.published";

  public async processWebhook(webhook: WebhookRequest): Promise<boolean> {
    const validationErrors = await validate(webhook);

    if (validationErrors.length > 0) {
      throw new InvalidWebhookRequestError(webhook);
    }
    if (webhook.name !== DCSnapshotPublishedWebhook.SUPPORTED_WEBHOOK_NAME) {
      throw new UnsupportedWebhookError(webhook);
    }

    log("Received webhook: %j", webhook);
    return true;
  }
}

export const expressHandler = async (
  req: express.Request,
  res: express.Response
): Promise<void> => {
  const handler = new DCSnapshotPublishedWebhook();
  const response = await handler.processWebhook(
    plainToClass(WebhookRequest, <object>req.body)
  );
  res.send(response);
};
