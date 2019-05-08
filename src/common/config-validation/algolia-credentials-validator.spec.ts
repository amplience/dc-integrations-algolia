import * as algoliasearch from './algolia-credentials-validator';
import { AlgoliaCredentialsValidator } from './algolia-credentials-validator';

const mockAlgoliaSearch = jest.fn();
jest.mock('algoliasearch', () => {
  return function() {
    return mockAlgoliaSearch.apply(null, arguments);
  };
});

describe('AlgoliaCredentialsValidator', () => {
  const ALGOLIA_APPLICATION_ID = 'ALGOLIA_APPLICATION_ID';
  const ALGOLIA_API_KEY = 'ALGOLIA_API_KEY';
  const ALGOLIA_INDEX_NAME = 'MY_INDEX';
  let processExitSpy;

  beforeEach(() => {
    processExitSpy = jest.spyOn(process, 'exit').mockImplementation();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  afterAll(() => {
    jest.resetAllMocks();
  });

  describe('validateCredentials', () => {
    it('should pass through when valid algolia credentials are provided', async () => {
      const mockGetApiKey = jest.fn();
      mockAlgoliaSearch.mockImplementation(() => {
        return {
          getApiKey: mockGetApiKey
        };
      });
      mockGetApiKey.mockResolvedValueOnce({ acl: ['addObject', 'browse'], indexes: ['MY_INDEX', 'ANOTHER_INDEX'] });

      await AlgoliaCredentialsValidator.validateCredentials({
        applicationId: ALGOLIA_APPLICATION_ID,
        apiKey: ALGOLIA_API_KEY
      , algoliaIndex: ALGOLIA_INDEX_NAME });
      expect(mockAlgoliaSearch).toHaveBeenCalledWith(
        ALGOLIA_APPLICATION_ID,
        ALGOLIA_API_KEY
      );
      expect(mockGetApiKey).toHaveBeenCalledWith(ALGOLIA_API_KEY);
      expect(processExitSpy).toHaveBeenCalledTimes(0);
    });

    it('should pass through when valid algolia credentials are provided - permissions are global across all indexes', async () => {
      const mockGetApiKey = jest.fn();
      mockAlgoliaSearch.mockImplementation( () => {
        return {
          getApiKey: mockGetApiKey
        }
      });
      mockGetApiKey.mockResolvedValueOnce({ acl: ['addObject', 'browse'] } );

      await AlgoliaCredentialsValidator.validateCredentials({ applicationId: ALGOLIA_APPLICATION_ID, apiKey: ALGOLIA_API_KEY, algoliaIndex: ALGOLIA_INDEX_NAME });
      expect(mockAlgoliaSearch).toHaveBeenCalledWith(
        ALGOLIA_APPLICATION_ID,
        ALGOLIA_API_KEY
      );
      expect(mockGetApiKey).toHaveBeenCalledWith(ALGOLIA_API_KEY);
      expect(processExitSpy).toHaveBeenCalledTimes(0);
    });

    it('should exit when invalid algolia api key is used', async () => {
      const errorMessage = 'Invalid Application-ID or API key';
      const mockGetApiKey = jest.fn();
      mockAlgoliaSearch.mockImplementation(() => {
        return {
          getApiKey: mockGetApiKey
        };
      });
      mockGetApiKey.mockImplementation(() => {
        throw new Error(errorMessage);
      });

      await AlgoliaCredentialsValidator.validateCredentials({
        applicationId: ALGOLIA_APPLICATION_ID,
        apiKey: ALGOLIA_API_KEY
      , algoliaIndex: ALGOLIA_INDEX_NAME});
      expect(mockAlgoliaSearch).toHaveBeenCalledWith(ALGOLIA_APPLICATION_ID, ALGOLIA_API_KEY);
      expect(mockGetApiKey).toHaveBeenCalledWith(ALGOLIA_API_KEY);
      expect(mockGetApiKey).toThrowError(errorMessage);
      expect(processExitSpy).toHaveBeenCalledTimes(1);
    });

    it('should exit when api key does not have addObject permission', async () => {
      const errorMessage = 'Method not allowed with this API key';
      const mockGetApiKey = jest.fn();
      mockAlgoliaSearch.mockImplementation(() => {
        return {
          getApiKey: mockGetApiKey
        };
      });
      mockGetApiKey.mockImplementation(() => {
        return { acl: ['browse'], indexes: ['MY_INDEX', 'ANOTHER_INDEX'] }
      });

      await AlgoliaCredentialsValidator.validateCredentials({
        applicationId: ALGOLIA_APPLICATION_ID,
        apiKey: ALGOLIA_API_KEY
      , algoliaIndex: ALGOLIA_INDEX_NAME});
      expect(mockAlgoliaSearch).toHaveBeenCalledWith(ALGOLIA_APPLICATION_ID, ALGOLIA_API_KEY);
      expect(mockGetApiKey).toHaveBeenCalledWith(ALGOLIA_API_KEY);
      expect(processExitSpy).toHaveBeenCalledTimes(1);
    });

    it('should exit when api key does not have addObject permission for specified index', async () => {
      const errorMessage = 'Method not allowed with this API key';
      const mockGetApiKey = jest.fn();
      mockAlgoliaSearch.mockImplementation( () => {
        return {
          getApiKey: mockGetApiKey
        }
      });
      mockGetApiKey.mockImplementation(() => {
        return { acl: ['addObject', 'browse'], indexes: ['ANOTHER_INDEX'] }
      });

      await AlgoliaCredentialsValidator.validateCredentials({ applicationId: ALGOLIA_APPLICATION_ID, apiKey: ALGOLIA_API_KEY, algoliaIndex: ALGOLIA_INDEX_NAME});
      expect(mockAlgoliaSearch).toHaveBeenCalledWith(
        ALGOLIA_APPLICATION_ID,
        ALGOLIA_API_KEY
      );
      expect(mockGetApiKey).toHaveBeenCalledWith(ALGOLIA_API_KEY);
      expect(processExitSpy).toHaveBeenCalledTimes(1);
    });
  });
});
