import { DcCredentialsValidator } from './dc-credentials-validator';

const mockDynamicContent = jest.fn();
jest.mock('dc-management-sdk-js', () => {
  return {
    ...jest.requireActual('dc-management-sdk-js'),
    DynamicContent: function DynamicContent() {
      return mockDynamicContent.apply(null, arguments);
    }
  };
});

describe('DcCredentialsValidator', () => {
  const DC_CLIENT_ID = 'DC_CLIENT_ID';
  const DC_CLIENT_SECRET = 'DC_CLIENT_SECRET';
  let processExitSpy;

  beforeEach(() => {
    processExitSpy = jest.spyOn(process, 'exit').mockImplementation();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  afterAll(() => {
    jest.resetAllMocks();
  });

  describe('validateCredentials', () => {
    it('should pass through when valid dc credentials are provided', async () => {
      const dcConfig = { authUrl: 'https://dc-auth', apiUrl: 'https://dc-api' };
      const mockListHubs = jest.fn();
      mockDynamicContent.mockImplementation(() => {
        return {
          hubs: {
            list: mockListHubs
          }
        };
      });
      mockListHubs.mockResolvedValueOnce([]);

      await DcCredentialsValidator.validateCredentials(
        { clientId: DC_CLIENT_ID, clientSecret: DC_CLIENT_SECRET },
        dcConfig
      );
      expect(mockDynamicContent).toHaveBeenCalledWith(
        {
          client_id: DC_CLIENT_ID,
          client_secret: DC_CLIENT_SECRET
        },
        dcConfig
      );
      expect(mockListHubs).toHaveBeenCalled();
      expect(processExitSpy).toHaveBeenCalledTimes(0);
    });

    it('should exit application when valid auth token cannot be acquired', async () => {
      const dcConfig = { authUrl: 'https://dc-auth', apiUrl: 'https://dc-api' };
      const errorMessage =
        'Error: Request failed with status code 401: {"errors":[{"message":"Unauthorized request."}]}';
      const mockListHubs = jest.fn();
      mockDynamicContent.mockImplementation(() => {
        return {
          hubs: {
            list: mockListHubs
          }
        };
      });
      mockListHubs.mockImplementation(() => {
        throw new Error(errorMessage);
      });

      await DcCredentialsValidator.validateCredentials(
        { clientId: DC_CLIENT_ID, clientSecret: DC_CLIENT_SECRET },
        dcConfig
      );
      expect(mockDynamicContent).toHaveBeenCalledWith(
        {
          client_id: DC_CLIENT_ID,
          client_secret: DC_CLIENT_SECRET
        },
        dcConfig
      );
      expect(mockListHubs).toHaveBeenCalled();
      expect(mockListHubs).toThrowError(errorMessage);
      expect(processExitSpy).toHaveBeenCalledTimes(1);
    });

    it('should exit application when user does not have hub read permission', async () => {
      const dcConfig = { authUrl: 'https://dc-auth', apiUrl: 'https://dc-api' };
      const errorMessage =
        'Error: Request failed with status code 403: {"errors":[{"message":"Authorization required."}]}';
      const mockListHubs = jest.fn();
      mockDynamicContent.mockImplementation(() => {
        return {
          hubs: {
            list: mockListHubs
          }
        };
      });
      mockListHubs.mockImplementation(() => {
        throw new Error(errorMessage);
      });

      await DcCredentialsValidator.validateCredentials(
        { clientId: DC_CLIENT_ID, clientSecret: DC_CLIENT_SECRET },
        dcConfig
      );
      expect(mockDynamicContent).toHaveBeenCalledWith(
        {
          client_id: DC_CLIENT_ID,
          client_secret: DC_CLIENT_SECRET
        },
        dcConfig
      );
      expect(mockListHubs).toHaveBeenCalled();
      expect(mockListHubs).toThrowError(errorMessage);
      expect(processExitSpy).toHaveBeenCalledTimes(1);
    });
  });
});
