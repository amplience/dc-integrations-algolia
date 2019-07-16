import getApp from '../src/express-application';
import * as request from 'supertest';
import { AMPLIENCE_WEBHOOK_SIGNATURE_HEADER } from '../src/middleware/validate-webhook-request';
import { WebhookSignature } from 'dc-management-sdk-js';
import * as snapshotPublishedWebhook from './__fixtures__/snapshot-published-webhook.json';
import * as nock from 'nock';
import * as mockDate from './helpers/mock-date';

describe('end-to-end', (): void => {
  beforeAll(
    (): void => {
      mockDate.setup();
    }
  );

  afterAll(
    (): void => {
      mockDate.restore();
      jest.restoreAllMocks();
    }
  );

  it('should accept valid webhook and add a ContentItem to the Algolia index', async (): Promise<void> => {
    process.env = {
      WEBHOOK_SECRET: 'webhook-secret',
      ALGOLIA_API_KEY: 'algolia-api-key',
      ALGOLIA_APPLICATION_ID: 'algolia-app-id',
      ALGOLIA_INDEX_NAME: 'algolia-index-name',
      DC_CLIENT_ID: 'dc-client-id',
      DC_CLIENT_SECRET: 'dc-secret',
      CONTENT_TYPE_WHITELIST: 'http://schema-id1.json',
      CONTENT_TYPE_PROPERTY_WHITELIST: '_meta;text1'
    };

    const validWebhook = snapshotPublishedWebhook;

    nock.load(`${__dirname}/__fixtures__/nocks.json`);

    await request(getApp())
      .post('/webhook')
      .set('Content-Type', 'application/json')
      .set(
        AMPLIENCE_WEBHOOK_SIGNATURE_HEADER,
        WebhookSignature.calculate(new Buffer(JSON.stringify(validWebhook)), process.env.WEBHOOK_SECRET)
      )
      .send(snapshotPublishedWebhook)
      .expect(202, {
        message: `Successfully added to index "${process.env.ALGOLIA_INDEX_NAME}"`,
        addedObject: {
          _meta: { name: 'text-area-en', schema: 'http://schema-id1.json' },
          text1: 'Text area EN - 10:18',
          objectID: '84a68172-bc22-48ad-b64a-4ae808bb13fe',
          publishedDate: '2019-07-15T00:00:00.000Z'
        }
      });
  });
});
