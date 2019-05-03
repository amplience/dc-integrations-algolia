import { DCSnapshotPublishedWebhook } from './dc-snapshot-published-webhook';
import { WebhookRequest } from '../dynamic-content/models/webhook-request';
import { UnsupportedWebhookError } from '../errors/unsupported-webhook-error';
import { InvalidWebhookRequestError } from '../errors/invalid-webhook-request-error';
import { Snapshot } from '../dynamic-content/models/snapshot';

describe('DCSnapshotPublishedWebhook spec', () => {
  describe('processWebhook', () => {
    it('should throw an exception for unsupported webhook events', async () => {
      const handler = new DCSnapshotPublishedWebhook();
      const webhookRequest = new WebhookRequest({
        name: 'unsupported',
        payload: new Snapshot({ id: 'snapshot-id', rootContentItem: { id: 'content-item-id' } })
      });
      try {
        await handler.processWebhook(webhookRequest);
        fail('Expecting an exception to be thrown');
      } catch (e) {
        expect(e).toBeInstanceOf(UnsupportedWebhookError);
      }
    });

    describe('invalid webhook requests', () => {
      it('should throw an exception for missing webhook name', async () => {
        const handler = new DCSnapshotPublishedWebhook();
        const webhookRequest = new WebhookRequest({});
        try {
          await handler.processWebhook(webhookRequest);
          fail('Expecting an exception to be thrown');
        } catch (e) {
          expect(e).toBeInstanceOf(InvalidWebhookRequestError);
        }
      });

      it('should throw an exception for missing webhook payload', async () => {
        const handler = new DCSnapshotPublishedWebhook();
        const webhookRequest = new WebhookRequest({
          name: DCSnapshotPublishedWebhook.SUPPORTED_WEBHOOK_NAME
        });
        try {
          await handler.processWebhook(webhookRequest);
          fail('Expecting an exception to be thrown');
        } catch (e) {
          expect(e).toBeInstanceOf(InvalidWebhookRequestError);
        }
      });
    });
  });
});
