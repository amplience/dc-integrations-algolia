import * as express from 'express';
import * as mocks from 'node-mocks-http';
import { Snapshot } from '../dynamic-content/models/snapshot';
import { WebhookRequest } from '../dynamic-content/models/webhook-request';
import { AlgoliaSearchRequestError } from '../errors/algolia-search-request-error';
import { DynamicContentRequestError } from '../errors/dynamic-content-request-error';
import { InvalidWebhookRequestError } from '../errors/invalid-webhook-request-error';
import { UnsupportedWebhookError } from '../errors/unsupported-webhook-error';
import {
  SnapshotPublishedWebhook,
  SnapshotPublishedWebhookPresenter,
  SnapshotPublishedWebhookRequest
} from './snapshot-published-webhook';
import { snapshotPublishedWebhookRouteHandler } from './snapshot-published-webhook-route-handler';
import { NoMatchingContentTypeSchemaError } from '../errors/no-matching-content-type-schema-error';
import { NoMatchingContentTypePropertyError } from '../errors/no-matching-content-type-property-error';

const mockProcessWebhook = jest.fn();
jest.mock(
  './snapshot-published-webhook',
  (): { [key: string]: Function } => {
    return {
      ...jest.requireActual('./snapshot-published-webhook'),
      SnapshotPublishedWebhook: {
        processWebhook(): Function {
          return mockProcessWebhook.apply(undefined, arguments);
        }
      }
    };
  }
);

describe('SnapshotPublishedRouteHandler', (): void => {
  beforeEach(
    (): void => {
      jest.resetAllMocks();
      // set up environment variables
      process.env = {
        ALGOLIA_API_KEY: 'algolia-api-key',
        ALGOLIA_APPLICATION_ID: 'algolia-app-id',
        ALGOLIA_INDEX_NAME: 'algolia-index-name',
        DC_CLIENT_ID: 'dc-client-id',
        DC_CLIENT_SECRET: 'dc-secret',
        CONTENT_TYPE_WHITELIST: 'schema-id1;schema-id2;schema-id3',
        CONTENT_TYPE_PROPERTY_WHITELIST: 'prop1,prop2,prop3'
      };
    }
  );

  function assertProcessWebhookParams(webhookRequest): void {
    expect(mockProcessWebhook).toBeCalledWith(
      new SnapshotPublishedWebhookRequest(
        {
          clientId: process.env.DC_CLIENT_ID,
          clientSecret: process.env.DC_CLIENT_SECRET,
          contentTypeWhitelist: process.env.CONTENT_TYPE_WHITELIST.split(';'),
          contentTypePropertyWhitelist: process.env.CONTENT_TYPE_PROPERTY_WHITELIST.split(',')
        },
        {
          apiKey: process.env.ALGOLIA_API_KEY,
          indexName: process.env.ALGOLIA_INDEX_NAME,
          applicationId: process.env.ALGOLIA_APPLICATION_ID
        },
        webhookRequest,
        {
          apiUrl: undefined,
          authUrl: undefined
        }
      ),
      {}
    );
  }

  describe('Route handler tests', (): void => {
    it('Should process a missing or empty whitelist', async (): Promise<void> => {
      process.env.CONTENT_TYPE_WHITELIST = undefined;
      mockProcessWebhook.mockImplementationOnce(
        (request: SnapshotPublishedWebhookRequest, presenter: SnapshotPublishedWebhookPresenter<void>): void =>
          presenter.successfullyAddedToIndex(request.algolia.indexName, { objectID: 'content-item-id' })
      );

      const webhookRequest: WebhookRequest = new WebhookRequest({
        name: SnapshotPublishedWebhook.SUPPORTED_WEBHOOK_NAME,
        payload: new Snapshot({ id: 'snapshot-id', rootContentItem: { id: 'content-item-id', body: {} } })
      });

      const req: express.Request = mocks.createRequest({
        body: webhookRequest
      });
      const res = mocks.createResponse();

      await snapshotPublishedWebhookRouteHandler(req, res, (): void => {});

      expect(mockProcessWebhook.mock.calls[0][0].dynamicContent.contentTypeWhitelist).toEqual([]);
      expect(res._getStatusCode()).toEqual(202);
    });
  });

  describe('Presenter tests', (): void => {
    it('Should call the successfullyAddedToIndex presenter method', async (): Promise<void> => {
      mockProcessWebhook.mockImplementationOnce(
        (request: SnapshotPublishedWebhookRequest, presenter: SnapshotPublishedWebhookPresenter<void>): void =>
          presenter.successfullyAddedToIndex(request.algolia.indexName, { objectID: 'content-item-id' })
      );

      const webhookRequest: WebhookRequest = new WebhookRequest({
        name: SnapshotPublishedWebhook.SUPPORTED_WEBHOOK_NAME,
        payload: new Snapshot({ id: 'snapshot-id', rootContentItem: { id: 'content-item-id', body: {} } })
      });

      const req: express.Request = mocks.createRequest({
        body: webhookRequest
      });
      const res = mocks.createResponse();

      await snapshotPublishedWebhookRouteHandler(req, res, (): void => {});

      assertProcessWebhookParams(webhookRequest);
      expect(res._getStatusCode()).toEqual(202);
      expect(res._getData()).toEqual({
        addedObject: { objectID: 'content-item-id' },
        message: 'Successfully added to index "algolia-index-name"'
      });
    });

    it('Should call the invalidWebhookRequestError presenter method', async (): Promise<void> => {
      const webhookRequest: WebhookRequest = new WebhookRequest({
        name: SnapshotPublishedWebhook.SUPPORTED_WEBHOOK_NAME,
        payload: new Snapshot({ id: 'snapshot-id', rootContentItem: { id: 'content-item-id', body: {} } })
      });

      mockProcessWebhook.mockImplementationOnce(
        (request: WebhookRequest, presenter: SnapshotPublishedWebhookPresenter<void>): void =>
          presenter.invalidWebhookRequestError(webhookRequest)
      );

      const req: express.Request = mocks.createRequest({
        body: webhookRequest
      });
      const res = mocks.createResponse();

      await snapshotPublishedWebhookRouteHandler(
        req,
        res,
        (err): void => {
          assertProcessWebhookParams(webhookRequest);
          expect(err).toBeInstanceOf(InvalidWebhookRequestError);
          expect(err.statusCode).toEqual(202);
        }
      );
    });

    it('Should call the unsupportedWebhookError presenter method', async (): Promise<void> => {
      const webhookRequest: WebhookRequest = new WebhookRequest({
        name: SnapshotPublishedWebhook.SUPPORTED_WEBHOOK_NAME,
        payload: new Snapshot({ id: 'snapshot-id', rootContentItem: { id: 'content-item-id', body: {} } })
      });

      mockProcessWebhook.mockImplementationOnce(
        (request: WebhookRequest, presenter: SnapshotPublishedWebhookPresenter<void>): void =>
          presenter.unsupportedWebhookError(webhookRequest)
      );

      const req: express.Request = mocks.createRequest({
        body: webhookRequest
      });
      const res = mocks.createResponse();

      await snapshotPublishedWebhookRouteHandler(
        req,
        res,
        (err): void => {
          assertProcessWebhookParams(webhookRequest);
          expect(err).toBeInstanceOf(UnsupportedWebhookError);
          expect(err.statusCode).toEqual(202);
        }
      );
    });

    it('Should call the dynamicContentRequestError presenter method', async (): Promise<void> => {
      const webhookRequest: WebhookRequest = new WebhookRequest({
        name: SnapshotPublishedWebhook.SUPPORTED_WEBHOOK_NAME,
        payload: new Snapshot({ id: 'snapshot-id', rootContentItem: { id: 'content-item-id', body: {} } })
      });

      mockProcessWebhook.mockImplementationOnce(
        (request: WebhookRequest, presenter: SnapshotPublishedWebhookPresenter<void>): void =>
          presenter.dynamicContentRequestError(new Error('UNAUTHORIZED'))
      );

      const req: express.Request = mocks.createRequest({
        body: webhookRequest
      });
      const res = mocks.createResponse();

      await snapshotPublishedWebhookRouteHandler(
        req,
        res,
        (err): void => {
          assertProcessWebhookParams(webhookRequest);
          expect(err).toBeInstanceOf(DynamicContentRequestError);
          expect(err.statusCode).toEqual(202);
        }
      );
    });

    it('Should call the noMatchingContentTypeSchemaError presenter method', async (): Promise<void> => {
      const webhookRequest: WebhookRequest = new WebhookRequest({
        name: SnapshotPublishedWebhook.SUPPORTED_WEBHOOK_NAME,
        payload: new Snapshot({ id: 'snapshot-id', rootContentItem: { id: 'content-item-id', body: {} } })
      });

      mockProcessWebhook.mockImplementationOnce(
        (request: WebhookRequest, presenter: SnapshotPublishedWebhookPresenter<void>): void =>
          presenter.noMatchingContentTypeSchemaError('schema', ['schema-id1', 'schema-id2', 'schema-id3'])
      );

      const req: express.Request = mocks.createRequest({
        body: webhookRequest
      });
      const res = mocks.createResponse();

      await snapshotPublishedWebhookRouteHandler(
        req,
        res,
        (err): void => {
          assertProcessWebhookParams(webhookRequest);
          expect(err).toBeInstanceOf(NoMatchingContentTypeSchemaError);
          expect(err.statusCode).toEqual(202);
        }
      );
    });

    it('Should call the noMatchingContentTypePropertyError presenter method', async (): Promise<void> => {
      const webhookRequest: WebhookRequest = new WebhookRequest({
        name: SnapshotPublishedWebhook.SUPPORTED_WEBHOOK_NAME,
        payload: new Snapshot({ id: 'snapshot-id', rootContentItem: { id: 'content-item-id', body: {} } })
      });

      mockProcessWebhook.mockImplementationOnce(
        (request: WebhookRequest, presenter: SnapshotPublishedWebhookPresenter<void>): void =>
          presenter.noMatchingContentTypePropertyError('my-prop', ['prop1', 'prop2', 'prop3'])
      );

      const req: express.Request = mocks.createRequest({
        body: webhookRequest
      });
      const res = mocks.createResponse();

      await snapshotPublishedWebhookRouteHandler(
        req,
        res,
        (err): void => {
          assertProcessWebhookParams(webhookRequest);
          expect(err).toBeInstanceOf(NoMatchingContentTypePropertyError);
          expect(err.statusCode).toEqual(202);
        }
      );
    });

    it('Should call the algoliaSearchRequestError presenter method', async (): Promise<void> => {
      const webhookRequest: WebhookRequest = new WebhookRequest({
        name: SnapshotPublishedWebhook.SUPPORTED_WEBHOOK_NAME,
        payload: new Snapshot({ id: 'snapshot-id', rootContentItem: { id: 'content-item-id', body: {} } })
      });

      mockProcessWebhook.mockImplementationOnce(
        (request: WebhookRequest, presenter: SnapshotPublishedWebhookPresenter<void>): void =>
          presenter.algoliaSearchRequestError(new Error('UNAUTHORIZED'))
      );

      const req: express.Request = mocks.createRequest({
        body: webhookRequest
      });
      const res = mocks.createResponse();

      await snapshotPublishedWebhookRouteHandler(
        req,
        res,
        (err): void => {
          assertProcessWebhookParams(webhookRequest);
          expect(err).toBeInstanceOf(AlgoliaSearchRequestError);
          expect(err.statusCode).toEqual(202);
        }
      );
    });
  });
});
