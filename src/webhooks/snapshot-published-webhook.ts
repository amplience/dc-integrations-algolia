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

export interface SnapshotPublishedWebhookPresenter<T> {

  invalidWebhookRequestError(webhook: WebhookRequest): T;

  unsupportedWebhookError(webhook: WebhookRequest): T;

  successful(): T;
}

export class SnapshotPublishedWebhookRequest {
  constructor(
    public readonly dynamicContent: { clientId: string; clientSecret: string },
    public readonly algolia: { apiKey: string; indexName: string; applicationId: string },
    public readonly webhook: WebhookRequest
  ) {}
}

export class SnapshotPublishedWebhook {
  public static readonly SUPPORTED_WEBHOOK_NAME = 'dynamic-content.snapshot.published';

  public static async processWebhook<T>(request: SnapshotPublishedWebhookRequest,
                                        presenter: SnapshotPublishedWebhookPresenter<T>): Promise<T> {
    const validationErrors = await validate(request.webhook);

    if (validationErrors.length > 0) {
      return presenter.invalidWebhookRequestError(request.webhook);
    }
    if (request.webhook.name !== SnapshotPublishedWebhook.SUPPORTED_WEBHOOK_NAME) {
      return presenter.unsupportedWebhookError(request.webhook);
    }

    log('Received webhook: %j', request.webhook);

    const dynamicContent = new DynamicContent({
      client_id: request.dynamicContent.clientId,
      client_secret: request.dynamicContent.clientSecret
    });
    const contentItem = await dynamicContent.contentItems.get(request.webhook.payload.rootContentItem.id);

    const algoliaClient = algoliasearch(request.algolia.applicationId, request.algolia.apiKey);
    const index = algoliaClient.initIndex(request.algolia.indexName);
    await index.addObject({ ...contentItem.body, objectID: contentItem.id });

    return presenter.successful();
  }
}

export const expressHandler = (req: express.Request, res: express.Response) => {
  const request = new SnapshotPublishedWebhookRequest({
      clientId: process.env.DC_CLIENT_ID,
      clientSecret: process.env.DC_CLIENT_SECRET
    },
    {
      apiKey: process.env.ALGOLIA_API_KEY,
      applicationId: process.env.ALGOLIA_APPLICATION_ID,
      indexName: process.env.ALGOLIA_INDEX_NAME
    },
    plainToClass(WebhookRequest, req.body as object)
    );
  const handler = new SnapshotPublishedWebhook();

  const presenter = new class implements SnapshotPublishedWebhookPresenter<void> {
    invalidWebhookRequestError(webhook: WebhookRequest): void {
      throw new InvalidWebhookRequestError(webhook);
    }

    successful(): void {
      res.status(202).send('successful');
    }

    unsupportedWebhookError(webhook: WebhookRequest): void {
      throw new UnsupportedWebhookError(webhook);
    }

  }();
  SnapshotPublishedWebhook.processWebhook(request, presenter);
};
