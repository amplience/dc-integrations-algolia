import { plainToClass } from 'class-transformer';
import * as express from 'express';
import { WebhookRequest } from '../dynamic-content/models/webhook-request';
import { AlgoliaSearchRequestError } from '../errors/algolia-search-request-error';
import { DynamicContentRequestError } from '../errors/dynamic-content-request-error';
import { InvalidWebhookRequestError } from '../errors/invalid-webhook-request-error';
import { NoMatchingContentTypeSchemaError } from '../errors/no-matching-content-type-schema-error';
import { UnsupportedWebhookError } from '../errors/unsupported-webhook-error';
import {
  SnapshotPublishedWebhook,
  SnapshotPublishedWebhookPresenter,
  SnapshotPublishedWebhookRequest
} from './snapshot-published-webhook';

export const snapshotPublishedWebhookRouteHandler = (req: express.Request, res: express.Response): Promise<void> => {
  const request = new SnapshotPublishedWebhookRequest(
    {
      clientId: process.env.DC_CLIENT_ID,
      clientSecret: process.env.DC_CLIENT_SECRET,
      contentTypeWhitelist: process.env.CONTENT_TYPE_WHITE_LIST.split(';')
    },
    {
      apiKey: process.env.ALGOLIA_API_KEY,
      applicationId: process.env.ALGOLIA_APPLICATION_ID,
      indexName: process.env.ALGOLIA_INDEX_NAME
    },
    plainToClass(WebhookRequest, req.body as object),
    {
      apiUrl: process.env.DC_API_URL,
      authUrl: process.env.DC_AUTH_URL
    }
  );

  const presenter = new (class implements SnapshotPublishedWebhookPresenter<void> {
    public invalidWebhookRequestError(webhook: WebhookRequest): never {
      throw new InvalidWebhookRequestError(webhook);
    }

    public unsupportedWebhookError(webhook: WebhookRequest): never {
      throw new UnsupportedWebhookError(webhook);
    }

    public dynamicContentRequestError(err: Error): never {
      throw new DynamicContentRequestError(err.message);
    }

    public noMatchingContentTypeSchemaError(schema: string, contentTypeWhitelist: string[]): void {
      throw new NoMatchingContentTypeSchemaError(schema, contentTypeWhitelist);
    }

    public algoliaSearchRequestError(err: Error): never {
      throw new AlgoliaSearchRequestError(err.message);
    }

    public successful(): void {
      res.status(202).send('successful');
    }
  })();
  return SnapshotPublishedWebhook.processWebhook(request, presenter);
};
