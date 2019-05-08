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
      const mockListIndexes = jest.fn();
      mockAlgoliaSearch.mockImplementation(() => {
        return {
          listIndexes: mockListIndexes
        };
      });
      mockListIndexes.mockResolvedValueOnce({ items: [] });

      await AlgoliaCredentialsValidator.validateCredentials({
        applicationId: ALGOLIA_APPLICATION_ID,
        apiKey: ALGOLIA_API_KEY
      });
      expect(mockAlgoliaSearch).toHaveBeenCalledWith(ALGOLIA_APPLICATION_ID, ALGOLIA_API_KEY);
      expect(mockListIndexes).toHaveBeenCalled();
      expect(processExitSpy).toHaveBeenCalledTimes(0);
    });

    it('should exit when invalid algolia api key is used', async () => {
      const errorMessage = 'Invalid Application-ID or API key';
      const mockListIndexes = jest.fn();
      mockAlgoliaSearch.mockImplementation(() => {
        return {
          listIndexes: mockListIndexes
        };
      });
      mockListIndexes.mockImplementation(() => {
        throw new Error(errorMessage);
      });

      await AlgoliaCredentialsValidator.validateCredentials({
        applicationId: ALGOLIA_APPLICATION_ID,
        apiKey: ALGOLIA_API_KEY
      });
      expect(mockAlgoliaSearch).toHaveBeenCalledWith(ALGOLIA_APPLICATION_ID, ALGOLIA_API_KEY);
      expect(mockListIndexes).toThrowError(errorMessage);
      expect(processExitSpy).toHaveBeenCalledTimes(1);
    });

    it('should exit when api key does not have list indexes permission', async () => {
      const errorMessage = 'Method not allowed with this API key';
      const mockListIndexes = jest.fn();
      mockAlgoliaSearch.mockImplementation(() => {
        return {
          listIndexes: mockListIndexes
        };
      });
      mockListIndexes.mockImplementation(() => {
        throw new Error(errorMessage);
      });

      await AlgoliaCredentialsValidator.validateCredentials({
        applicationId: ALGOLIA_APPLICATION_ID,
        apiKey: ALGOLIA_API_KEY
      });
      expect(mockAlgoliaSearch).toHaveBeenCalledWith(ALGOLIA_APPLICATION_ID, ALGOLIA_API_KEY);
      expect(mockListIndexes).toThrowError(errorMessage);
      expect(processExitSpy).toHaveBeenCalledTimes(1);
    });
  });
});
