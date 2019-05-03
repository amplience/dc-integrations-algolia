import { ContentItem } from 'dc-management-sdk-js';
import { Snapshot } from '../dynamic-content/models/snapshot';
import { WebhookRequest } from '../dynamic-content/models/webhook-request';
import { InvalidWebhookRequestError } from '../errors/invalid-webhook-request-error';
import { UnsupportedWebhookError } from '../errors/unsupported-webhook-error';
import { DCSnapshotPublishedWebhook } from './dc-snapshot-published-webhook';

const mockDynamicContent = jest.fn();
jest.mock('dc-management-sdk-js', () => {
  return {
    ...jest.requireActual('dc-management-sdk-js'),
    DynamicContent() {
      return mockDynamicContent.apply(null, arguments);
    }
  };
});

const mockAlgoliasearch = jest.fn();
jest.mock('algoliasearch', () => {
  return function() {
    return mockAlgoliasearch.apply(null, arguments);
  };
});

describe('DCSnapshotPublishedWebhook spec', () => {
  const DC_CLIENT_ID = 'DC_CLIENT_ID';
  const DC_CLIENT_SECRET = 'DC_CLIENT_SECRET';

  const ALGOLIA_API_KEY = 'ALGOLIA_API_KEY';
  const ALGOLIA_APPLICATION_ID = 'ALGOLIA_APPLICATION_ID';
  const ALGOLIA_INDEX_NAME = 'ALGOLIA_INDEX_NAME';

  let handler: DCSnapshotPublishedWebhook;

  beforeEach(() => {
    handler = new DCSnapshotPublishedWebhook({
      dynamicContent: {
        clientId: DC_CLIENT_ID,
        clientSecret: DC_CLIENT_SECRET
      },
      algolia: {
        apiKey: ALGOLIA_API_KEY,
        applicationId: ALGOLIA_APPLICATION_ID,
        indexName: ALGOLIA_INDEX_NAME
      }
    });
  });

  describe('invalid webhook requests', () => {
    it('should throw an exception for unsupported webhook events', async () => {
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

    it('should throw an exception for missing webhook name', async () => {
      const webhookRequest = new WebhookRequest({});
      try {
        await handler.processWebhook(webhookRequest);
        fail('Expecting an exception to be thrown');
      } catch (e) {
        expect(e).toBeInstanceOf(InvalidWebhookRequestError);
      }
    });

    it('should throw an exception for missing webhook payload', async () => {
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

  describe('validate webhook', () => {
    it('should add the DC Snapshots root ContentItem to the Aloglia index', async () => {
      const mockGetContentItems = jest.fn();
      mockDynamicContent.mockImplementation(() => {
        return {
          contentItems: {
            get: mockGetContentItems
          }
        };
      });

      const contentItem = new ContentItem({
        id: 'content-item-id',
        body: {
          _meta: {
            name: 'main-banner',
            schema: 'http://deliver.bigcontent.io/schema/nested/nested-type.json'
          },
          heading: 'Buy more stuff!!',
          link: 'http://anyafinn.com/buymore?campaign=shouting'
        }
      });
      mockGetContentItems.mockResolvedValueOnce(contentItem);

      const mockAddObject = jest.fn();

      const mockInitIndex = jest.fn().mockReturnValue({
        addObject: mockAddObject
      });
      mockAlgoliasearch.mockReturnValue({
        initIndex: mockInitIndex
      });

      const webhookRequest = new WebhookRequest({
        name: DCSnapshotPublishedWebhook.SUPPORTED_WEBHOOK_NAME,
        payload: new Snapshot({ id: 'snapshot-id', rootContentItem: { id: 'content-item-id' } })
      });

      const result = await handler.processWebhook(webhookRequest);

      expect(mockDynamicContent).toHaveBeenCalledWith({
        client_id: DC_CLIENT_ID,
        client_secret: DC_CLIENT_SECRET
      });
      expect(mockGetContentItems).toHaveBeenCalled();

      expect(mockAlgoliasearch).toHaveBeenCalledWith(ALGOLIA_APPLICATION_ID, ALGOLIA_API_KEY);
      expect(mockInitIndex).toHaveBeenCalledWith(ALGOLIA_INDEX_NAME);
      expect(mockAddObject).toHaveBeenCalledWith({ ...contentItem.body, objectID: contentItem.id });

      expect(result).toEqual(true);
    });
  });
});
