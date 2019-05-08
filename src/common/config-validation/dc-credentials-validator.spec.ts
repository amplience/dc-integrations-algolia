import { DcCredentialsValidator } from './dc-credentials-validator';

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

interface MockHubsList {
  hubs: { list: Function };
}

describe('DcCredentialsValidator', (): void => {
  const DC_CLIENT_ID = 'DC_CLIENT_ID';
  const DC_CLIENT_SECRET = 'DC_CLIENT_SECRET';
  let processExitSpy;

  beforeEach(
    (): void => {
      processExitSpy = jest.spyOn(process, 'exit').mockImplementation();
    }
  );

  afterEach(
    (): void => {
      jest.restoreAllMocks();
    }
  );

  afterAll(
    (): void => {
      jest.resetAllMocks();
    }
  );

  describe('validateCredentials', (): void => {
    it('should pass through when valid dc credentials are provided', async (): Promise<void> => {
      const dcConfig = { authUrl: 'https://dc-auth', apiUrl: 'https://dc-api' };
      const mockListHubs = jest.fn();
      mockDynamicContent.mockImplementation(
        (): MockHubsList => {
          return {
            hubs: {
              list: mockListHubs
            }
          };
        }
      );
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

    it('should exit application when valid auth token cannot be acquired', async (): Promise<void> => {
      const dcConfig = { authUrl: 'https://dc-auth', apiUrl: 'https://dc-api' };
      const errorMessage =
        'Error: Request failed with status code 401: {"errors":[{"message":"Unauthorized request."}]}';
      const mockListHubs = jest.fn();
      mockDynamicContent.mockImplementation(
        (): MockHubsList => {
          return {
            hubs: {
              list: mockListHubs
            }
          };
        }
      );
      mockListHubs.mockImplementation(
        (): void => {
          throw new Error(errorMessage);
        }
      );

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

    it('should exit application when user does not have hub read permission', async (): Promise<void> => {
      const dcConfig = { authUrl: 'https://dc-auth', apiUrl: 'https://dc-api' };
      const errorMessage =
        'Error: Request failed with status code 403: {"errors":[{"message":"Authorization required."}]}';
      const mockListHubs = jest.fn();
      mockDynamicContent.mockImplementation(
        (): MockHubsList => {
          return {
            hubs: {
              list: mockListHubs
            }
          };
        }
      );
      mockListHubs.mockImplementation(
        (): void => {
          throw new Error(errorMessage);
        }
      );

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
