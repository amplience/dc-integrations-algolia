import * as algoliasearch from 'algoliasearch';
import { validate } from 'class-validator';
import { ContentItem, DynamicContent } from 'dc-management-sdk-js';
import * as debug from 'debug';
import { WebhookRequest } from '../dynamic-content/models/webhook-request';

const log = debug('dc-integrations-algolia:webhook');

export class SnapshotPublishedWebhookRequest {
  constructor(
    public readonly dynamicContent: { clientId: string; clientSecret: string },
    public readonly algolia: { apiKey: string; indexName: string; applicationId: string },
    public readonly webhook: WebhookRequest
  ) {}
}

export interface SnapshotPublishedWebhookPresenter<T> {
  invalidWebhookRequestError(webhook: WebhookRequest): T;

  unsupportedWebhookError(webhook: WebhookRequest): T;

  dynamicContentRequestError(error: Error): T;

  algoliaSearchRequestError(error: Error): T;

  successful(): T;
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
