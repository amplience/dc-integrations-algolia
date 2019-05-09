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

const mockProcessWebhook = jest.fn();
jest.mock('./snapshot-published-webhook', () => {
  return {
    ...jest.requireActual('./snapshot-published-webhook'),
    SnapshotPublishedWebhook: {
      processWebhook() {
        return mockProcessWebhook.apply(undefined, arguments);
      }
    }
  };
});

describe('SnapshotPublishedRouteHandler', () => {
  beforeAll(() => {
    // set up environment variables
    process.env = {
      ALGOLIA_API_KEY: 'algolia-api-key',
      ALGOLIA_APPLICATION_ID: 'algolia-app-id',
      ALGOLIA_INDEX_NAME: 'algolia-index-name',
      DC_CLIENT_ID: 'dc-client-id',
      DC_CLIENT_SECRET: 'dc-secret',
      CONTENT_TYPE_WHITE_LIST: 'schema-id1;schema-id2;schema-id3'
    };
  });

  function assertProcessWebhookParams(webhookRequest) {
    expect(mockProcessWebhook).toBeCalledWith(
      new SnapshotPublishedWebhookRequest(
        {
          clientId: process.env.DC_CLIENT_ID,
          clientSecret: process.env.DC_CLIENT_SECRET,
          contentTypeWhitelist: process.env.CONTENT_TYPE_WHITE_LIST.split(';')
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

  describe('Presenter tests', () => {
    it('Should call the successful presenter method', async () => {
      mockProcessWebhook.mockImplementationOnce(
        (request: WebhookRequest, presenter: SnapshotPublishedWebhookPresenter<void>) => presenter.successful()
      );

      const webhookRequest: WebhookRequest = new WebhookRequest({
        name: SnapshotPublishedWebhook.SUPPORTED_WEBHOOK_NAME,
        payload: new Snapshot({ id: 'snapshot-id', rootContentItem: { id: 'content-item-id' } })
      });

      const req: express.Request = mocks.createRequest({
        body: webhookRequest
      });
      const res = mocks.createResponse();

      await snapshotPublishedWebhookRouteHandler(req, res);

      assertProcessWebhookParams(webhookRequest);
      expect(res._getStatusCode()).toEqual(202);
    });

    it('Should call the invalidWebhookRequestError presenter method', async done => {
      const webhookRequest: WebhookRequest = new WebhookRequest({
        name: SnapshotPublishedWebhook.SUPPORTED_WEBHOOK_NAME,
        payload: new Snapshot({ id: 'snapshot-id', rootContentItem: { id: 'content-item-id' } })
      });

      mockProcessWebhook.mockImplementationOnce(
        (request: WebhookRequest, presenter: SnapshotPublishedWebhookPresenter<void>) =>
          presenter.invalidWebhookRequestError(webhookRequest)
      );

      const req: express.Request = mocks.createRequest({
        body: webhookRequest
      });
      const res = mocks.createResponse();

      try {
        await snapshotPublishedWebhookRouteHandler(req, res);
        done.fail('Expected an error to be thrown');
      } catch (err) {
        assertProcessWebhookParams(webhookRequest);
        expect(err).toBeInstanceOf(InvalidWebhookRequestError);
        expect(err.statusCode).toEqual(202);
        done();
      }
    });

    it('Should call the unsupportedWebhookError presenter method', async done => {
      const webhookRequest: WebhookRequest = new WebhookRequest({
        name: SnapshotPublishedWebhook.SUPPORTED_WEBHOOK_NAME,
        payload: new Snapshot({ id: 'snapshot-id', rootContentItem: { id: 'content-item-id' } })
      });

      mockProcessWebhook.mockImplementationOnce(
        (request: WebhookRequest, presenter: SnapshotPublishedWebhookPresenter<void>) =>
          presenter.unsupportedWebhookError(webhookRequest)
      );

      const req: express.Request = mocks.createRequest({
        body: webhookRequest
      });
      const res = mocks.createResponse();

      try {
        await snapshotPublishedWebhookRouteHandler(req, res);
        done.fail('Expected an error to be thrown');
      } catch (err) {
        assertProcessWebhookParams(webhookRequest);
        expect(err).toBeInstanceOf(UnsupportedWebhookError);
        expect(err.statusCode).toEqual(202);
        done();
      }
    });

    it('Should call the dynamicContentRequestError presenter method', async done => {
      const webhookRequest: WebhookRequest = new WebhookRequest({
        name: SnapshotPublishedWebhook.SUPPORTED_WEBHOOK_NAME,
        payload: new Snapshot({ id: 'snapshot-id', rootContentItem: { id: 'content-item-id' } })
      });

      mockProcessWebhook.mockImplementationOnce(
        (request: WebhookRequest, presenter: SnapshotPublishedWebhookPresenter<void>) =>
          presenter.dynamicContentRequestError(new Error('UNAUTHORIZED'))
      );

      const req: express.Request = mocks.createRequest({
        body: webhookRequest
      });
      const res = mocks.createResponse();

      try {
        await snapshotPublishedWebhookRouteHandler(req, res);
        done.fail('Expected an error to be thrown');
      } catch (err) {
        assertProcessWebhookParams(webhookRequest);
        expect(err).toBeInstanceOf(DynamicContentRequestError);
        expect(err.statusCode).toEqual(500);
        done();
      }
    });

    it('Should call the algoliaSearchRequestError presenter method', async done => {
      const webhookRequest: WebhookRequest = new WebhookRequest({
        name: SnapshotPublishedWebhook.SUPPORTED_WEBHOOK_NAME,
        payload: new Snapshot({ id: 'snapshot-id', rootContentItem: { id: 'content-item-id' } })
      });

      mockProcessWebhook.mockImplementationOnce(
        (request: WebhookRequest, presenter: SnapshotPublishedWebhookPresenter<void>) =>
          presenter.algoliaSearchRequestError(new Error('UNAUTHORIZED'))
      );

      const req: express.Request = mocks.createRequest({
        body: webhookRequest
      });
      const res = mocks.createResponse();

      try {
        await snapshotPublishedWebhookRouteHandler(req, res);
        done.fail('Expected an error to be thrown');
      } catch (err) {
        assertProcessWebhookParams(webhookRequest);
        expect(err).toBeInstanceOf(AlgoliaSearchRequestError);
        expect(err.statusCode).toEqual(500);
        done();
      }
    });
  });
});
