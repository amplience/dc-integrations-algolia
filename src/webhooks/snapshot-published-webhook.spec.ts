import { ContentItem } from 'dc-management-sdk-js';
import { Snapshot } from '../dynamic-content/models/snapshot';
import { WebhookRequest } from '../dynamic-content/models/webhook-request';
import {
  SnapshotPublishedWebhook,
  SnapshotPublishedWebhookPresenter,
  SnapshotPublishedWebhookRequest
} from './snapshot-published-webhook';

const mockDynamicContent = jest.fn();
jest.mock(
  'dc-management-sdk-js',
  (): Function => {
    return {
      ...jest.requireActual('dc-management-sdk-js'),
      DynamicContent: function DynamicContent(): Function {
        return mockDynamicContent.apply(null, arguments);
      }
    };
  }
);

const mockAlgoliasearch = jest.fn();
jest.mock(
  'algoliasearch',
  (): Function => {
    return function(): Function {
      return mockAlgoliasearch.apply(null, arguments);
    };
  }
);

interface MockContentItemsGet {
  contentItems: { get: Function };
}
describe('SnapshotPublishedWebhook spec', (): void => {
  const DC_CLIENT_ID = 'DC_CLIENT_ID';
  const DC_CLIENT_SECRET = 'DC_CLIENT_SECRET';
  const CONTENT_TYPE_WHITELIST = [
    'http://deliver.bigcontent.io/schema/my-schema-type.json',
    'http://deliver.bigcontent.io/schema/nested/nested-type.json',
    'http://deliver.bigcontent.io/schema/my-other-schema-type.json'
  ];

  const ALGOLIA_API_KEY = 'ALGOLIA_API_KEY';
  const ALGOLIA_APPLICATION_ID = 'ALGOLIA_APPLICATION_ID';
  const ALGOLIA_INDEX_NAME = 'ALGOLIA_INDEX_NAME';

  const UNSUPPORTED_WEBHOOK_ERROR = 'unsupportedWebhookError';
  const INVALID_WEBHOOK_REQUEST_ERROR = 'invalidWebhookRequestError';
  const DYNAMIC_CONTENT_REQUEST_ERROR = 'dynamicContentRequestError';
  const NO_MATCHING_CONTENT_TYPE_SCHEMA_ERROR = 'noMatchingContentTypeSchemaError';
  const ALGOLIA_SEARCH_REQUEST_ERROR = 'algoliaSearchRequestError';
  const SUCCESSFUL_RESPONSE = 'successful';

  const fakePresenter = new (class implements SnapshotPublishedWebhookPresenter<string> {
    public invalidWebhookRequestError(): string {
      return INVALID_WEBHOOK_REQUEST_ERROR;
    }

    public unsupportedWebhookError(): string {
      return UNSUPPORTED_WEBHOOK_ERROR;
    }

    public dynamicContentRequestError(): string {
      return DYNAMIC_CONTENT_REQUEST_ERROR;
    }

    public noMatchingContentTypeSchemaError(): string {
      return NO_MATCHING_CONTENT_TYPE_SCHEMA_ERROR;
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
  let noMatchingContentTypeSchemaError;
  let algoliaSearchRequestError;
  let successfulResponse;
  beforeEach(
    (): void => {
      unsupportedWebhookErrorSpy = jest.spyOn(fakePresenter, 'unsupportedWebhookError');
      invalidWebhookRequestError = jest.spyOn(fakePresenter, 'invalidWebhookRequestError');
      dynamicContentRequestError = jest.spyOn(fakePresenter, 'dynamicContentRequestError');
      noMatchingContentTypeSchemaError = jest.spyOn(fakePresenter, 'noMatchingContentTypeSchemaError');
      algoliaSearchRequestError = jest.spyOn(fakePresenter, 'algoliaSearchRequestError');
      successfulResponse = jest.spyOn(fakePresenter, 'successful');
    }
  );

  describe('invalid webhook requests', (): void => {
    it('should throw an exception for unsupported webhook events', async (): Promise<void> => {
      const request = new SnapshotPublishedWebhookRequest(
        {
          clientId: DC_CLIENT_ID,
          clientSecret: DC_CLIENT_SECRET,
          contentTypeWhitelist: CONTENT_TYPE_WHITELIST
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

    it('should throw an exception for missing webhook name', async (): Promise<void> => {
      const request = new SnapshotPublishedWebhookRequest(
        {
          clientId: DC_CLIENT_ID,
          clientSecret: DC_CLIENT_SECRET,
          contentTypeWhitelist: CONTENT_TYPE_WHITELIST
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

    it('should throw an exception for missing webhook payload', async (): Promise<void> => {
      const request = new SnapshotPublishedWebhookRequest(
        {
          clientId: DC_CLIENT_ID,
          clientSecret: DC_CLIENT_SECRET,
          contentTypeWhitelist: CONTENT_TYPE_WHITELIST
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

  describe('valid webhook', (): void => {
    it('should add the DC Snapshots root ContentItem to the Aloglia index', async (): Promise<void> => {
      const mockGetContentItems = jest.fn();
      mockDynamicContent.mockImplementation(
        (): MockContentItemsGet => {
          return {
            contentItems: {
              get: mockGetContentItems
            }
          };
        }
      );

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
          clientSecret: DC_CLIENT_SECRET,
          contentTypeWhitelist: CONTENT_TYPE_WHITELIST
        },
        {
          apiKey: ALGOLIA_API_KEY,
          applicationId: ALGOLIA_APPLICATION_ID,
          indexName: ALGOLIA_INDEX_NAME
        },
        new WebhookRequest({
          name: SnapshotPublishedWebhook.SUPPORTED_WEBHOOK_NAME,
          payload: new Snapshot({
            id: 'snapshot-id',
            rootContentItem: { id: 'content-item-id' }
          })
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

  describe('Dynamic Content Service failures', (): void => {
    it('Throws an exception when the Dynamic Content SDK throws an error', async (): Promise<void> => {
      const mockGetContentItems = jest.fn();
      mockDynamicContent.mockImplementation(
        (): MockContentItemsGet => {
          return {
            contentItems: {
              get: mockGetContentItems
            }
          };
        }
      );

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
          clientSecret: DC_CLIENT_SECRET,
          contentTypeWhitelist: CONTENT_TYPE_WHITELIST
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
    it('Throws an exception when the content type schema id cannot be matched', async (): Promise<void> => {
      const mockGetContentItems = jest.fn();
      mockDynamicContent.mockImplementation(
        (): MockContentItemsGet => {
          return {
            contentItems: {
              get: mockGetContentItems
            }
          };
        }
      );

      const contentItem = new ContentItem({
        id: 'content-item-id',
        body: {
          _meta: {
            name: 'main-banner',
            schema: 'http://deliver.bigcontent.io/schema/fake-schema.json'
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
          clientSecret: DC_CLIENT_SECRET,
          contentTypeWhitelist: CONTENT_TYPE_WHITELIST
        },
        {
          apiKey: ALGOLIA_API_KEY,
          applicationId: ALGOLIA_APPLICATION_ID,
          indexName: ALGOLIA_INDEX_NAME
        },
        new WebhookRequest({
          name: SnapshotPublishedWebhook.SUPPORTED_WEBHOOK_NAME,
          payload: new Snapshot({
            id: 'snapshot-id',
            rootContentItem: { id: 'content-item-id' }
          })
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

      expect(noMatchingContentTypeSchemaError).toHaveBeenCalled();
      expect(response).toEqual(NO_MATCHING_CONTENT_TYPE_SCHEMA_ERROR);
    });
  });

  describe('Algolia Service failures', (): void => {
    it('Throws an exception when the addObject method throws an error', async (): Promise<void> => {
      const mockGetContentItems = jest.fn();
      mockDynamicContent.mockImplementation(
        (): MockContentItemsGet => {
          return {
            contentItems: {
              get: mockGetContentItems
            }
          };
        }
      );

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
          clientSecret: DC_CLIENT_SECRET,
          contentTypeWhitelist: CONTENT_TYPE_WHITELIST
        },
        {
          apiKey: ALGOLIA_API_KEY,
          applicationId: ALGOLIA_APPLICATION_ID,
          indexName: ALGOLIA_INDEX_NAME
        },
        new WebhookRequest({
          name: SnapshotPublishedWebhook.SUPPORTED_WEBHOOK_NAME,
          payload: new Snapshot({
            id: 'snapshot-id',
            rootContentItem: { id: 'content-item-id' }
          })
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
