import * as express from 'express';
import * as mocks from 'node-mocks-http';
import { WebhookRequest } from '../dynamic-content/models/webhook-request';
import {
  SnapshotPublishedWebhookPresenter,
  snapshotPublishedWebhookRouteHandler
} from './snapshot-published-webhook-route-handler';
import { SnapshotPublishedWebhook, SnapshotPublishedWebhookRequest } from './snapshot-published-webhook';
import { Snapshot } from '../dynamic-content/models/snapshot';
import { plainToClass } from 'class-transformer';

const mockProcessWebhook = jest.fn();
jest.mock('./snapshot-published-webhook', () => {
  return {
    ...jest.requireActual('./snapshot-published-webhook'),
    SnapshotPublishedWebhook: {
      processWebhook: function() {
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
      DC_CLIENT_SECRET: 'dc-secret'
    };
  });

  describe('Presenter tests', () => {
    it('Should call the success', async () => {
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
      const res: express.Response = mocks.createResponse();

      await snapshotPublishedWebhookRouteHandler(req, res);
      expect(mockProcessWebhook).toBeCalledWith(
        new SnapshotPublishedWebhookRequest(
          {
            clientId: process.env.DC_CLIENT_ID,
            clientSecret: process.env.DC_CLIENT_SECRET
          },
          {
            apiKey: process.env.ALGOLIA_API_KEY,
            indexName: process.env.ALGOLIA_INDEX_NAME,
            applicationId: process.env.ALGOLIA_APPLICATION_ID
          },
          webhookRequest
        ),
        {}
      );
    });
  });
});
