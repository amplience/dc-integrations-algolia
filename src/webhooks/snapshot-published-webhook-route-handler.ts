import { plainToClass } from 'class-transformer';
import * as express from 'express';
import { WebhookRequest } from '../dynamic-content/models/webhook-request';
import { AlgoliaSearchRequestError } from '../errors/algolia-search-request-error';
import { DynamicContentRequestError } from '../errors/dynamic-content-request-error';
import { InvalidWebhookRequestError } from '../errors/invalid-webhook-request-error';
import { NoMatchingContentTypeSchemaError } from '../errors/no-matching-content-type-schema-error';
import { UnsupportedWebhookError } from '../errors/unsupported-webhook-error';
import {
  AlgoliaObject,
  SnapshotPublishedWebhook,
  SnapshotPublishedWebhookPresenter,
  SnapshotPublishedWebhookRequest
} from './snapshot-published-webhook';
import * as debug from 'debug';

const error = debug('dc-integrations-algolia:webhook-error');
const warning = debug('dc-integrations-algolia:webhook-warning');
const success = debug('dc-integrations-algolia:webhook-success');
import { NoMatchingContentTypePropertiesError } from '../errors/no-matching-content-type-properties-error';

export const snapshotPublishedWebhookRouteHandler = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
): Promise<void> => {
  const CONTENT_TYPE_WHITELIST = process.env.CONTENT_TYPE_WHITELIST;
  const CONTENT_TYPE_PROPERTY_WHITELIST = process.env.CONTENT_TYPE_PROPERTY_WHITELIST;
  const request = new SnapshotPublishedWebhookRequest(
    {
      clientId: process.env.DC_CLIENT_ID,
      clientSecret: process.env.DC_CLIENT_SECRET,
      contentTypeWhitelist: CONTENT_TYPE_WHITELIST ? CONTENT_TYPE_WHITELIST.split(';') : [],
      contentTypePropertyWhitelist: CONTENT_TYPE_PROPERTY_WHITELIST ? CONTENT_TYPE_PROPERTY_WHITELIST.split(',') : []
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
      error('Invalid webhook: %j', webhook);
      throw new InvalidWebhookRequestError(webhook);
    }

    public unsupportedWebhookError(webhook: WebhookRequest): never {
      warning('Unsupported webhook: %j', webhook);
      throw new UnsupportedWebhookError(webhook);
    }

    public dynamicContentRequestError(err: Error): never {
      error('Error occurred wile trying to get DynamicContent ContentItem: %o', err);
      throw new DynamicContentRequestError(err.message);
    }

    public noMatchingContentTypeSchemaError(schema: string, contentTypeWhitelist: string[]): never {
      warning(
        'Cannot process webhook. ContentItem schema "%s" is not in the whitelist: %o',
        schema,
        contentTypeWhitelist
      );
      throw new NoMatchingContentTypeSchemaError(schema, contentTypeWhitelist);
    }

    public noMatchingContentTypePropertiesError(properties: string[], contentTypePropertyWhitelist: string[]): never {
      throw new NoMatchingContentTypePropertiesError(properties, contentTypePropertyWhitelist);
    }

    public algoliaSearchRequestError(err: Error): never {
      error('Error occurred wile trying to get Algolia: %o', err);
      throw new AlgoliaSearchRequestError(err.message);
    }

    public successfullyAddedToIndex(algoliaIndexName: string, addedObject: AlgoliaObject): void {
      success('Successfully added %j to index "%s"', addedObject, algoliaIndexName);
      res.status(202).send({ message: `Successfully added to index "${algoliaIndexName}"`, addedObject: addedObject });
    }
  })();
  try {
    return await SnapshotPublishedWebhook.processWebhook(request, presenter);
  } catch (err) {
    return next(err);
  }
};
