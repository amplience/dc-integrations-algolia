import getApp from '../src/express-application';
import * as request from 'supertest';
import { AMPLIENCE_WEBHOOK_SIGNATURE_HEADER } from '../src/middleware/validate-webhook-request';
import { WebhookSignature } from 'dc-management-sdk-js';
import * as snapshotPublishedWebhook from './__fixtures__/snapshot-published-webhook.json';
import * as nock from 'nock';

describe('end-to-end', (): void => {
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

    jest.spyOn(Date, 'now').mockImplementation((): number => 1558531107888);

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
          _meta: {
            name: 'text-area-en',
            schema: 'http://schema-id1.json'
          },
          text1: 'Text area EN - 10:18',
          _lastModifiedDate: 1558531107,
          _snapshotCreatedDate: 1557392294,
          _contentItemCreatedDate: 1544449310,
          _contentItemLastModifiedDate: 1557478081,
          objectID: '84a68172-bc22-48ad-b64a-4ae808bb13fe'
        }
      });
  });
});
