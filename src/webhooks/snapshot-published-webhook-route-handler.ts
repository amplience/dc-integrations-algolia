import * as express from 'express';
import { plainToClass } from 'class-transformer';
import { WebhookRequest } from '../dynamic-content/models/webhook-request';
import { InvalidWebhookRequestError } from '../errors/invalid-webhook-request-error';
import { UnsupportedWebhookError } from '../errors/unsupported-webhook-error';
import { DynamicContentRequestError } from '../errors/dynamic-content-request-error';
import { AlgoliaSearchRequestError } from '../errors/algolia-search-request-error';
import { SnapshotPublishedWebhookRequest, SnapshotPublishedWebhook } from './snapshot-published-webhook';

export interface SnapshotPublishedWebhookPresenter<T> {
  invalidWebhookRequestError(webhook: WebhookRequest): T;

  unsupportedWebhookError(webhook: WebhookRequest): T;

  dynamicContentRequestError(error: Error): T;

  algoliaSearchRequestError(error: Error): T;

  successful(): T;
}

export const snapshotPublishedWebhookRouteHandler = (req: express.Request, res: express.Response): Promise<void> => {
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
