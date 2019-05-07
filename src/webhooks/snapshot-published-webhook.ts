import * as algoliasearch from 'algoliasearch';
import { plainToClass } from 'class-transformer';
import { validate } from 'class-validator';
import { ContentItem, DynamicContent } from 'dc-management-sdk-js';
import * as debug from 'debug';
import * as express from 'express';
import { WebhookRequest } from '../dynamic-content/models/webhook-request';
import { InvalidWebhookRequestError } from '../errors/invalid-webhook-request-error';
import { UnsupportedWebhookError } from '../errors/unsupported-webhook-error';
import { DynamicContentRequestError } from '../errors/dynamic-content-request-error';
import { AlgoliaSearchRequestError } from '../errors/algolia-search-request-error';

const log = debug('dc-snasphot-published-webhook');

export interface SnapshotPublishedWebhookPresenter<T> {
  invalidWebhookRequestError(webhook: WebhookRequest): T;

  unsupportedWebhookError(webhook: WebhookRequest): T;

  dynamicContentRequestError(error: Error): T;

  algoliaSearchRequestError(error: Error): T;

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

  public static async processWebhook<T>(
    request: SnapshotPublishedWebhookRequest,
    presenter: SnapshotPublishedWebhookPresenter<T>
  ): Promise<T> {
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

    let contentItem: ContentItem;
    try {
      contentItem = await dynamicContent.contentItems.get(request.webhook.payload.rootContentItem.id);
    } catch (err) {
      return presenter.dynamicContentRequestError(err);
    }

    try {
      const algoliaClient = algoliasearch(request.algolia.applicationId, request.algolia.apiKey);
      const index = algoliaClient.initIndex(request.algolia.indexName);
      await index.addObject({ ...contentItem.body, objectID: contentItem.id });
    } catch (err) {
      return presenter.algoliaSearchRequestError(err);
    }

    return presenter.successful();
  }
}

export const expressHandler = (req: express.Request, res: express.Response) => {
  const request = new SnapshotPublishedWebhookRequest(
    {
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

  const presenter = new (class implements SnapshotPublishedWebhookPresenter<void> {
    invalidWebhookRequestError(webhook: WebhookRequest): never {
      throw new InvalidWebhookRequestError(webhook);
    }

    unsupportedWebhookError(webhook: WebhookRequest): never {
      throw new UnsupportedWebhookError(webhook);
    }

    dynamicContentRequestError(err: Error): never {
      throw new DynamicContentRequestError(err.message);
    }

    algoliaSearchRequestError(err: Error): never {
      throw new AlgoliaSearchRequestError(err.message);
    }

    successful(): void {
      res.status(202).send('successful');
    }
  })();
  return SnapshotPublishedWebhook.processWebhook(request, presenter);
};
