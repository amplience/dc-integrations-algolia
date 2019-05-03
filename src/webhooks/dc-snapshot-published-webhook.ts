import * as algoliasearch from 'algoliasearch';
import { plainToClass } from 'class-transformer';
import { validate } from 'class-validator';
import { DynamicContent } from 'dc-management-sdk-js';
import * as debug from 'debug';
import * as express from 'express';
import { WebhookRequest } from '../dynamic-content/models/webhook-request';
import { InvalidWebhookRequestError } from '../errors/invalid-webhook-request-error';
import { UnsupportedWebhookError } from '../errors/unsupported-webhook-error';

const log = debug('dc-snasphot-published-webhook');

export class DCSnapshotPublishedWebhook {
  public static readonly SUPPORTED_WEBHOOK_NAME = 'dynamic-content.snapshot.published';

  constructor(
    private readonly options: {
      dynamicContent: { clientId: string; clientSecret: string };
      algolia: { applicationId: string; apiKey: string; indexName: string };
    }
  ) {}

  public async processWebhook(webhook: WebhookRequest): Promise<boolean> {
    const validationErrors = await validate(webhook);

    if (validationErrors.length > 0) {
      throw new InvalidWebhookRequestError(webhook);
    }
    if (webhook.name !== DCSnapshotPublishedWebhook.SUPPORTED_WEBHOOK_NAME) {
      throw new UnsupportedWebhookError(webhook);
    }

    log('Received webhook: %j', webhook);

    const dynamicContent = new DynamicContent({
      client_id: this.options.dynamicContent.clientId,
      client_secret: this.options.dynamicContent.clientSecret
    });
    const contentItem = await dynamicContent.contentItems.get(webhook.payload.rootContentItem.id);

    const algoliaClient = algoliasearch(this.options.algolia.applicationId, this.options.algolia.apiKey);
    const index = algoliaClient.initIndex(this.options.algolia.indexName);
    await index.addObject({ ...contentItem.body, objectID: contentItem.id });

    return true;
  }
}

export const expressHandler = (req: express.Request, res: express.Response) => {
  const handler = new DCSnapshotPublishedWebhook({
    dynamicContent: {
      clientId: process.env.DC_CLIENT_ID,
      clientSecret: process.env.DC_CLIENT_SECRET
    },
    algolia: {
      apiKey: process.env.ALGOLIA_API_KEY,
      applicationId: process.env.ALGOLIA_APPLICATION_ID,
      indexName: process.env.ALGOLIA_INDEX_NAME
    }
  });
  const response = handler.processWebhook(plainToClass(WebhookRequest, req.body as object));
  res.send(response);
};
