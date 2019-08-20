import { AlgoliaCredentialsValidator } from './algolia-credentials-validator';

const mockAlgoliaSearch = jest.fn();
jest.mock(
  'algoliasearch',
  (): Function => {
    return function(): Function {
      return mockAlgoliaSearch.apply(null, arguments);
    };
  }
);

interface MockGetApiKeyFunction {
  getApiKey: Function;
}

interface MockGetApiKeyFunctionResponse {
  acl: string[];
  indexes: string[];
}

describe('AlgoliaCredentialsValidator', (): void => {
  const ALGOLIA_APPLICATION_ID = 'ALGOLIA_APPLICATION_ID';
  const ALGOLIA_WRITE_API_KEY = 'ALGOLIA_WRITE_API_KEY';
  const ALGOLIA_INDEX_NAME = 'MY_INDEX';
  let processExitSpy;

  beforeEach(
    (): void => {
      processExitSpy = jest.spyOn(process, 'exit').mockImplementation();
    }
  );

  afterEach(
    (): void => {
      jest.resetAllMocks();
    }
  );

  afterAll(
    (): void => {
      jest.resetAllMocks();
    }
  );

  describe('validateCredentials', (): void => {
    it('should pass through when valid algolia credentials are provided', async (): Promise<void> => {
      const mockGetApiKey = jest.fn();
      mockAlgoliaSearch.mockImplementation(
        (): MockGetApiKeyFunction => {
          return {
            getApiKey: mockGetApiKey
          };
        }
      );
      mockGetApiKey.mockResolvedValueOnce({ acl: ['addObject', 'browse'], indexes: ['MY_INDEX', 'ANOTHER_INDEX'] });

      await AlgoliaCredentialsValidator.validateCredentials({
        applicationId: ALGOLIA_APPLICATION_ID,
        apiKey: ALGOLIA_WRITE_API_KEY,
        algoliaIndex: ALGOLIA_INDEX_NAME
      });
      expect(mockAlgoliaSearch).toHaveBeenCalledWith(ALGOLIA_APPLICATION_ID, ALGOLIA_WRITE_API_KEY);
      expect(mockGetApiKey).toHaveBeenCalledWith(ALGOLIA_WRITE_API_KEY);
      expect(processExitSpy).toHaveBeenCalledTimes(0);
    });

    it('should pass through when valid algolia credentials are provided - permissions are global across all indexes', async (): Promise<
      void
    > => {
      const mockGetApiKey = jest.fn();
      mockAlgoliaSearch.mockImplementation(
        (): MockGetApiKeyFunction => {
          return {
            getApiKey: mockGetApiKey
          };
        }
      );
      mockGetApiKey.mockResolvedValueOnce({ acl: ['addObject', 'browse'] });

      await AlgoliaCredentialsValidator.validateCredentials({
        applicationId: ALGOLIA_APPLICATION_ID,
        apiKey: ALGOLIA_WRITE_API_KEY,
        algoliaIndex: ALGOLIA_INDEX_NAME
      });
      expect(mockAlgoliaSearch).toHaveBeenCalledWith(ALGOLIA_APPLICATION_ID, ALGOLIA_WRITE_API_KEY);
      expect(mockGetApiKey).toHaveBeenCalledWith(ALGOLIA_WRITE_API_KEY);
      expect(processExitSpy).toHaveBeenCalledTimes(0);
    });

    it('should pass through when valid algolia credentials are provided - using global wilcarded index', async (): Promise<
      void
    > => {
      const mockGetApiKey = jest.fn();
      mockAlgoliaSearch.mockImplementation(
        (): MockGetApiKeyFunction => {
          return {
            getApiKey: mockGetApiKey
          };
        }
      );
      mockGetApiKey.mockResolvedValueOnce({ acl: ['addObject', 'browse'], indexes: ['*'] });

      await AlgoliaCredentialsValidator.validateCredentials({
        applicationId: ALGOLIA_APPLICATION_ID,
        apiKey: ALGOLIA_WRITE_API_KEY,
        algoliaIndex: ALGOLIA_INDEX_NAME
      });
      expect(mockAlgoliaSearch).toHaveBeenCalledWith(ALGOLIA_APPLICATION_ID, ALGOLIA_WRITE_API_KEY);
      expect(mockGetApiKey).toHaveBeenCalledWith(ALGOLIA_WRITE_API_KEY);
      expect(processExitSpy).toHaveBeenCalledTimes(0);
    });

    it('should pass through when valid algolia credentials are provided - using wilcarded prefix index', async (): Promise<
      void
    > => {
      const mockGetApiKey = jest.fn();
      mockAlgoliaSearch.mockImplementation(
        (): MockGetApiKeyFunction => {
          return {
            getApiKey: mockGetApiKey
          };
        }
      );
      mockGetApiKey.mockResolvedValueOnce({ acl: ['addObject', 'browse'], indexes: ['*INDEX'] });

      await AlgoliaCredentialsValidator.validateCredentials({
        applicationId: ALGOLIA_APPLICATION_ID,
        apiKey: ALGOLIA_WRITE_API_KEY,
        algoliaIndex: ALGOLIA_INDEX_NAME
      });
      expect(mockAlgoliaSearch).toHaveBeenCalledWith(ALGOLIA_APPLICATION_ID, ALGOLIA_WRITE_API_KEY);
      expect(mockGetApiKey).toHaveBeenCalledWith(ALGOLIA_WRITE_API_KEY);
      expect(processExitSpy).toHaveBeenCalledTimes(0);
    });

    it('should pass through when valid algolia credentials are provided - using wilcarded suffix index', async (): Promise<
      void
    > => {
      const mockGetApiKey = jest.fn();
      mockAlgoliaSearch.mockImplementation(
        (): MockGetApiKeyFunction => {
          return {
            getApiKey: mockGetApiKey
          };
        }
      );
      mockGetApiKey.mockResolvedValueOnce({ acl: ['addObject', 'browse'], indexes: ['MY*'] });

      await AlgoliaCredentialsValidator.validateCredentials({
        applicationId: ALGOLIA_APPLICATION_ID,
        apiKey: ALGOLIA_WRITE_API_KEY,
        algoliaIndex: ALGOLIA_INDEX_NAME
      });
      expect(mockAlgoliaSearch).toHaveBeenCalledWith(ALGOLIA_APPLICATION_ID, ALGOLIA_WRITE_API_KEY);
      expect(mockGetApiKey).toHaveBeenCalledWith(ALGOLIA_WRITE_API_KEY);
      expect(processExitSpy).toHaveBeenCalledTimes(0);
    });

    it('should exit when invalid algolia api key is used', async (): Promise<void> => {
      const errorMessage = 'Invalid Application-ID or API key';
      const mockGetApiKey = jest.fn();
      mockAlgoliaSearch.mockImplementation(
        (): MockGetApiKeyFunction => {
          return {
            getApiKey: mockGetApiKey
          };
        }
      );
      mockGetApiKey.mockImplementation(
        (): MockGetApiKeyFunctionResponse => {
          throw new Error(errorMessage);
        }
      );

      await AlgoliaCredentialsValidator.validateCredentials({
        applicationId: ALGOLIA_APPLICATION_ID,
        apiKey: ALGOLIA_WRITE_API_KEY,
        algoliaIndex: ALGOLIA_INDEX_NAME
      });
      expect(mockAlgoliaSearch).toHaveBeenCalledWith(ALGOLIA_APPLICATION_ID, ALGOLIA_WRITE_API_KEY);
      expect(mockGetApiKey).toHaveBeenCalledWith(ALGOLIA_WRITE_API_KEY);
      expect(mockGetApiKey).toThrowError(errorMessage);
      expect(processExitSpy).toHaveBeenCalledTimes(1);
    });

    it('should exit when api key does not have addObject permission', async (): Promise<void> => {
      const mockGetApiKey = jest.fn();
      mockAlgoliaSearch.mockImplementation(
        (): MockGetApiKeyFunction => {
          return {
            getApiKey: mockGetApiKey
          };
        }
      );
      mockGetApiKey.mockImplementation(
        (): MockGetApiKeyFunctionResponse => {
          return { acl: ['browse'], indexes: ['MY_INDEX', 'ANOTHER_INDEX'] };
        }
      );

      await AlgoliaCredentialsValidator.validateCredentials({
        applicationId: ALGOLIA_APPLICATION_ID,
        apiKey: ALGOLIA_WRITE_API_KEY,
        algoliaIndex: ALGOLIA_INDEX_NAME
      });
      expect(mockAlgoliaSearch).toHaveBeenCalledWith(ALGOLIA_APPLICATION_ID, ALGOLIA_WRITE_API_KEY);
      expect(mockGetApiKey).toHaveBeenCalledWith(ALGOLIA_WRITE_API_KEY);
      expect(processExitSpy).toHaveBeenCalledTimes(1);
    });

    it('should exit when api key does not have addObject permission for specified index', async (): Promise<void> => {
      const mockGetApiKey = jest.fn();
      mockAlgoliaSearch.mockImplementation(
        (): MockGetApiKeyFunction => {
          return {
            getApiKey: mockGetApiKey
          };
        }
      );
      mockGetApiKey.mockImplementation(
        (): MockGetApiKeyFunctionResponse => {
          return { acl: ['addObject', 'browse'], indexes: ['ANOTHER_INDEX'] };
        }
      );
      await AlgoliaCredentialsValidator.validateCredentials({
        applicationId: ALGOLIA_APPLICATION_ID,
        apiKey: ALGOLIA_WRITE_API_KEY,
        algoliaIndex: ALGOLIA_INDEX_NAME
      });
      expect(mockAlgoliaSearch).toHaveBeenCalledWith(ALGOLIA_APPLICATION_ID, ALGOLIA_WRITE_API_KEY);
      expect(mockGetApiKey).toHaveBeenCalledWith(ALGOLIA_WRITE_API_KEY);
      expect(processExitSpy).toHaveBeenCalledTimes(1);
    });
  });
});
