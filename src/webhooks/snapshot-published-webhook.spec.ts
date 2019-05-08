import { ContentItem } from 'dc-management-sdk-js';
import { Snapshot } from '../dynamic-content/models/snapshot';
import { WebhookRequest } from '../dynamic-content/models/webhook-request';
import {
  SnapshotPublishedWebhook,
  SnapshotPublishedWebhookPresenter,
  SnapshotPublishedWebhookRequest
} from './snapshot-published-webhook';

const mockDynamicContent = jest.fn();
jest.mock('dc-management-sdk-js', () => {
  return {
    ...jest.requireActual('dc-management-sdk-js'),
    DynamicContent: function DynamicContent() {
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

describe('SnapshotPublishedWebhook spec', () => {
  const DC_CLIENT_ID = 'DC_CLIENT_ID';
  const DC_CLIENT_SECRET = 'DC_CLIENT_SECRET';

  const ALGOLIA_API_KEY = 'ALGOLIA_API_KEY';
  const ALGOLIA_APPLICATION_ID = 'ALGOLIA_APPLICATION_ID';
  const ALGOLIA_INDEX_NAME = 'ALGOLIA_INDEX_NAME';

  const UNSUPPORTED_WEBHOOK_ERROR = 'unsupportedWebhookError';
  const INVALID_WEBHOOK_REQUEST_ERROR = 'invalidWebhookRequestError';
  const DYNAMIC_CONTENT_REQUEST_ERROR = 'dynamicContentRequestError';
  const ALGOLIA_SEARCH_REQUEST_ERROR = 'algoliaSearchRequestError';
  const SUCCESSFUL_RESPONSE = 'successful';

  const fakePresenter = new (class implements SnapshotPublishedWebhookPresenter<string> {
    public invalidWebhookRequestError(webhook: WebhookRequest): string {
      return INVALID_WEBHOOK_REQUEST_ERROR;
    }

    public unsupportedWebhookError(webhook: WebhookRequest): string {
      return UNSUPPORTED_WEBHOOK_ERROR;
    }

    public dynamicContentRequestError(): string {
      return DYNAMIC_CONTENT_REQUEST_ERROR;
    }

    public algoliaSearchRequestError(): string {
      return ALGOLIA_SEARCH_REQUEST_ERROR;
    }

    public successful(): string {
      return SUCCESSFUL_RESPONSE;
    }
  })();

  let unsupportedWebhookErrorSpy;
  let invalidWebhookRequestError;
  let dynamicContentRequestError;
  let algoliaSearchRequestError;
  let successfulResponse;
  beforeEach(() => {
    unsupportedWebhookErrorSpy = jest.spyOn(fakePresenter, 'unsupportedWebhookError');
    invalidWebhookRequestError = jest.spyOn(fakePresenter, 'invalidWebhookRequestError');
    dynamicContentRequestError = jest.spyOn(fakePresenter, 'dynamicContentRequestError');
    algoliaSearchRequestError = jest.spyOn(fakePresenter, 'algoliaSearchRequestError');
    successfulResponse = jest.spyOn(fakePresenter, 'successful');
  });

  describe('invalid webhook requests', () => {
    it('should throw an exception for unsupported webhook events', async () => {
      const request = new SnapshotPublishedWebhookRequest(
        {
          clientId: DC_CLIENT_ID,
          clientSecret: DC_CLIENT_SECRET
        },
        {
          apiKey: ALGOLIA_API_KEY,
          applicationId: ALGOLIA_APPLICATION_ID,
          indexName: ALGOLIA_INDEX_NAME
        },
        new WebhookRequest({
          name: 'unsupported',
          payload: new Snapshot({ id: 'snapshot-id', rootContentItem: { id: 'content-item-id' } })
        })
      );
      const response = await SnapshotPublishedWebhook.processWebhook(request, fakePresenter);

      expect(response).toEqual(UNSUPPORTED_WEBHOOK_ERROR);
      expect(unsupportedWebhookErrorSpy).toHaveBeenCalled();
    });

    it('should throw an exception for missing webhook name', async () => {
      const request = new SnapshotPublishedWebhookRequest(
        {
          clientId: DC_CLIENT_ID,
          clientSecret: DC_CLIENT_SECRET
        },
        {
          apiKey: ALGOLIA_API_KEY,
          applicationId: ALGOLIA_APPLICATION_ID,
          indexName: ALGOLIA_INDEX_NAME
        },
        new WebhookRequest({
          payload: new Snapshot({ id: 'snapshot-id', rootContentItem: { id: 'content-item-id' } })
        })
      );
      const response = await SnapshotPublishedWebhook.processWebhook(request, fakePresenter);

      expect(response).toEqual(INVALID_WEBHOOK_REQUEST_ERROR);
      expect(invalidWebhookRequestError).toHaveBeenCalled();
    });

    it('should throw an exception for missing webhook payload', async () => {
      const request = new SnapshotPublishedWebhookRequest(
        {
          clientId: DC_CLIENT_ID,
          clientSecret: DC_CLIENT_SECRET
        },
        {
          apiKey: ALGOLIA_API_KEY,
          applicationId: ALGOLIA_APPLICATION_ID,
          indexName: ALGOLIA_INDEX_NAME
        },
        new WebhookRequest({
          name: SnapshotPublishedWebhook.SUPPORTED_WEBHOOK_NAME
        })
      );

      const response = await SnapshotPublishedWebhook.processWebhook(request, fakePresenter);

      expect(response).toEqual(INVALID_WEBHOOK_REQUEST_ERROR);
      expect(invalidWebhookRequestError).toHaveBeenCalled();
    });
  });

  describe('valid webhook', () => {
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

      const request = new SnapshotPublishedWebhookRequest(
        {
          clientId: DC_CLIENT_ID,
          clientSecret: DC_CLIENT_SECRET
        },
        {
          apiKey: ALGOLIA_API_KEY,
          applicationId: ALGOLIA_APPLICATION_ID,
          indexName: ALGOLIA_INDEX_NAME
        },
        new WebhookRequest({
          name: SnapshotPublishedWebhook.SUPPORTED_WEBHOOK_NAME,
          payload: new Snapshot({ id: 'snapshot-id', rootContentItem: { id: 'content-item-id' } })
        })
      );

      const response = await SnapshotPublishedWebhook.processWebhook(request, fakePresenter);

      expect(mockDynamicContent).toHaveBeenCalledWith(
        {
          client_id: DC_CLIENT_ID,
          client_secret: DC_CLIENT_SECRET
        },
        undefined
      );
      expect(mockGetContentItems).toHaveBeenCalled();

      expect(mockAlgoliasearch).toHaveBeenCalledWith(ALGOLIA_APPLICATION_ID, ALGOLIA_API_KEY);
      expect(mockInitIndex).toHaveBeenCalledWith(ALGOLIA_INDEX_NAME);
      expect(mockAddObject).toHaveBeenCalledWith({ ...contentItem.body, objectID: contentItem.id });

      expect(response).toEqual(SUCCESSFUL_RESPONSE);
      expect(successfulResponse).toHaveBeenCalled();
    });
  });

  describe('Dynamic Content Service failures', () => {
    it('Throws an exception when the Dynamic Content SDK throws an error', async () => {
      const mockGetContentItems = jest.fn();
      mockDynamicContent.mockImplementation(() => {
        return {
          contentItems: {
            get: mockGetContentItems
          }
        };
      });

      mockGetContentItems.mockRejectedValueOnce(new Error('UNAUTHORIZED'));

      const mockAddObject = jest.fn();

      const mockInitIndex = jest.fn().mockReturnValue({
        addObject: mockAddObject
      });
      mockAlgoliasearch.mockReturnValue({
        initIndex: mockInitIndex
      });

      const request = new SnapshotPublishedWebhookRequest(
        {
          clientId: DC_CLIENT_ID,
          clientSecret: DC_CLIENT_SECRET
        },
        {
          apiKey: ALGOLIA_API_KEY,
          applicationId: ALGOLIA_APPLICATION_ID,
          indexName: ALGOLIA_INDEX_NAME
        },
        new WebhookRequest({
          name: SnapshotPublishedWebhook.SUPPORTED_WEBHOOK_NAME,
          payload: new Snapshot({ id: 'snapshot-id', rootContentItem: { id: 'content-item-id' } })
        })
      );

      const response = await SnapshotPublishedWebhook.processWebhook(request, fakePresenter);

      expect(mockDynamicContent).toHaveBeenCalledWith(
        {
          client_id: DC_CLIENT_ID,
          client_secret: DC_CLIENT_SECRET
        },
        undefined
      );
      expect(mockGetContentItems).toHaveBeenCalled();

      expect(dynamicContentRequestError).toHaveBeenCalled();
      expect(response).toEqual(DYNAMIC_CONTENT_REQUEST_ERROR);
    });
  });

  describe('Algolia Service failures', () => {
    it('Throws an exception when the addObject method throws an error', async () => {
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
      mockAddObject.mockRejectedValueOnce(new Error('UNAUTHORIZED'));

      const mockInitIndex = jest.fn().mockReturnValue({
        addObject: mockAddObject
      });
      mockAlgoliasearch.mockReturnValue({
        initIndex: mockInitIndex
      });

      const request = new SnapshotPublishedWebhookRequest(
        {
          clientId: DC_CLIENT_ID,
          clientSecret: DC_CLIENT_SECRET
        },
        {
          apiKey: ALGOLIA_API_KEY,
          applicationId: ALGOLIA_APPLICATION_ID,
          indexName: ALGOLIA_INDEX_NAME
        },
        new WebhookRequest({
          name: SnapshotPublishedWebhook.SUPPORTED_WEBHOOK_NAME,
          payload: new Snapshot({ id: 'snapshot-id', rootContentItem: { id: 'content-item-id' } })
        })
      );

      const response = await SnapshotPublishedWebhook.processWebhook(request, fakePresenter);

      expect(mockDynamicContent).toHaveBeenCalledWith(
        {
          client_id: DC_CLIENT_ID,
          client_secret: DC_CLIENT_SECRET
        },
        undefined
      );
      expect(mockGetContentItems).toHaveBeenCalled();

      expect(algoliaSearchRequestError).toHaveBeenCalled();
      expect(response).toEqual(ALGOLIA_SEARCH_REQUEST_ERROR);
    });
  });
});
