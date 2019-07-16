import * as algoliasearch from 'algoliasearch';
import { validate } from 'class-validator';
import { ContentItem, DynamicContent, OAuth2ClientCredentials } from 'dc-management-sdk-js';
import { DynamicContentConfig } from 'dc-management-sdk-js/build/main/lib/DynamicContent';
import * as debug from 'debug';
import { WebhookRequest } from '../dynamic-content/models/webhook-request';

const log = debug('dc-integrations-algolia:webhook');

export class SnapshotPublishedWebhookRequest {
  public constructor(
    public readonly dynamicContent: {
      clientId: string;
      clientSecret: string;
      contentTypeWhitelist: string[];
      contentTypePropertyWhitelist: string[];
    },
    public readonly algolia: { apiKey: string; indexName: string; applicationId: string },
    public readonly webhook: WebhookRequest,
    public readonly dcConfig?: DynamicContentConfig
  ) {}
}

export interface AlgoliaObject {
  objectID: string;
  publishedDate: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}

export interface SnapshotPublishedWebhookPresenter<T> {
  invalidWebhookRequestError(webhook: WebhookRequest): T;

  unsupportedWebhookError(webhook: WebhookRequest): T;

  dynamicContentRequestError(error: Error): T;

  noMatchingContentTypeSchemaError(schema: string, contentTypeWhitelist: string[]): T;

  noMatchingContentTypePropertiesError(properties: string[], contentTypePropertyWhitelist: string[]): T;

  algoliaSearchRequestError(error: Error): T;

  successfullyAddedToIndex(algoliaIndexName: string, addedObject: AlgoliaObject): T;
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

    const clientCredentials: OAuth2ClientCredentials = {
      client_id: request.dynamicContent.clientId,
      client_secret: request.dynamicContent.clientSecret
    };
    const dynamicContent = new DynamicContent(clientCredentials, request.dcConfig);

    let contentItem: ContentItem;
    try {
      const snapshot = await dynamicContent.snapshots.get(request.webhook.payload.id);
      contentItem = await snapshot.related.snapshotContentItem(request.webhook.payload.rootContentItem.id);
    } catch (err) {
      return presenter.dynamicContentRequestError(err);
    }

    const contentItemSchema = contentItem.body._meta.schema;
    const contentTypeWhitelist = request.dynamicContent.contentTypeWhitelist;
    if (!SnapshotPublishedWebhook.isContentTypeSchemaInWhitelist(contentItemSchema, contentTypeWhitelist)) {
      return presenter.noMatchingContentTypeSchemaError(contentItemSchema, contentTypeWhitelist);
    }

    const properties = Object.keys(contentItem.body);
    const includedProperties = SnapshotPublishedWebhook.filterPropertiesInWhitelist(
      properties,
      request.dynamicContent.contentTypePropertyWhitelist
    );
    if (includedProperties.length == 0) {
      return presenter.noMatchingContentTypePropertiesError(
        properties,
        request.dynamicContent.contentTypePropertyWhitelist
      );
    }

    const objectToAddToIndex: AlgoliaObject = {
      ...includedProperties.reduce((obj, prop): object => ({ ...obj, [prop]: contentItem.body[prop] }), {}),
      objectID: contentItem.id,
      publishedDate: new Date().toISOString()
    };
    const algoliaIndexName = request.algolia.indexName;
    try {
      const algoliaClient = algoliasearch(request.algolia.applicationId, request.algolia.apiKey);
      const index = algoliaClient.initIndex(algoliaIndexName);
      await index.addObject(objectToAddToIndex);
    } catch (err) {
      return presenter.algoliaSearchRequestError(err);
    }

    return presenter.successfullyAddedToIndex(algoliaIndexName, objectToAddToIndex);
  }

  public static isContentTypeSchemaInWhitelist(schema: string, contentTypeWhitelist: string[]): boolean {
    return contentTypeWhitelist.length == 0 || contentTypeWhitelist.some((schemaId): boolean => schema === schemaId);
  }

  public static filterPropertiesInWhitelist(properties: string[], propertyWhitelist: string[]): string[] {
    return propertyWhitelist.length > 0
      ? properties.filter((prop): boolean => propertyWhitelist.some((whitelistProp): boolean => whitelistProp === prop))
      : properties;
  }
}
