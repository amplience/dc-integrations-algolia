import * as Joi from '@hapi/joi';
import { EnvConfigValidator } from './env-config-validator';

describe('env-config-validator', (): void => {
  let processExitSpy;
  let validateSpy;

  beforeEach(
    (): void => {
      validateSpy = jest.spyOn(Joi, 'validate');
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

  describe('validEnvironment() - success', (): void => {
    it('should pass through when all required config values exist', (): void => {
      EnvConfigValidator.validateEnvironment({
        WEBHOOK_SECRET: 'secret',
        ALGOLIA_API_KEY: 'algolia-api-key',
        ALGOLIA_APPLICATION_ID: 'algolia-application-id',
        ALGOLIA_INDEX_NAME: 'algolia-index-name',
        DC_CLIENT_ID: 'dc-client-id',
        DC_CLIENT_SECRET: 'dc-secret',
        CONTENT_TYPE_WHITELIST: 'http://schema-id1.json'
      });
      expect(validateSpy.mock.results[0].value.error).toBe(null);
      expect(processExitSpy).toHaveBeenCalledTimes(0);
    });

    it('should pass through when all required config values exist and ignore unknown value', (): void => {
      EnvConfigValidator.validateEnvironment({
        WEBHOOK_SECRET: 'secret',
        ALGOLIA_API_KEY: 'algolia-api-key',
        ALGOLIA_APPLICATION_ID: 'algolia-application-id',
        ALGOLIA_INDEX_NAME: 'algolia-index-name',
        DC_CLIENT_ID: 'dc-client-id',
        DC_CLIENT_SECRET: 'dc-secret',
        IGNORE_ME: 'im-not-here',
        CONTENT_TYPE_WHITELIST: 'http://schema-id1.json'
      });
      expect(validateSpy.mock.results[0].value.error).toBe(null);
      expect(processExitSpy).toHaveBeenCalledTimes(0);
    });

    it('should pass through when all required config values exist and ignore an optional value', (): void => {
      EnvConfigValidator.validateEnvironment({
        WEBHOOK_SECRET: 'secret',
        ALGOLIA_API_KEY: 'algolia-api-key',
        ALGOLIA_APPLICATION_ID: 'algolia-application-id',
        ALGOLIA_INDEX_NAME: 'algolia-index-name',
        DC_CLIENT_ID: 'dc-client-id',
        DC_CLIENT_SECRET: 'dc-secret'
      });
      expect(validateSpy.mock.results[0].value.error).toBe(null);
      expect(processExitSpy).toHaveBeenCalledTimes(0);
    });
  });
  describe('validEnvironment() - fail', (): void => {
    it('should exit the process if a required config value is missing', (): void => {
      EnvConfigValidator.validateEnvironment({
        WEBHOOK_SECRET: 'secret',
        ALGOLIA_API_KEY: 'algolia-api-key',
        ALGOLIA_APPLICATION_ID: 'algolia-application-id',
        ALGOLIA_INDEX_NAME: 'algolia-index-name',
        DC_CLIENT_ID: 'dc-client-id',
        CONTENT_TYPE_WHITELIST: 'http://schema-id1.json'
      });
      expect(validateSpy.mock.results[0].value.error).toBeDefined();
      expect(validateSpy.mock.results[0].value.error.details[0].message).toEqual('"DC_CLIENT_SECRET" is required');
      expect(processExitSpy).toHaveBeenCalledWith(1);
    });

    it('should exit the process if a required config value is empty', (): void => {
      EnvConfigValidator.validateEnvironment({
        WEBHOOK_SECRET: 'secret',
        ALGOLIA_API_KEY: 'algolia-api-key',
        ALGOLIA_APPLICATION_ID: 'algolia-application-id',
        ALGOLIA_INDEX_NAME: 'algolia-index-name',
        DC_CLIENT_ID: 'dc-client-id',
        DC_CLIENT_SECRET: '',
        CONTENT_TYPE_WHITELIST: 'http://schema-id1.json'
      });
      expect(validateSpy.mock.results[0].value.error).toBeDefined();
      expect(validateSpy.mock.results[0].value.error.details[0].message).toEqual(
        '"DC_CLIENT_SECRET" is not allowed to be empty'
      );
      expect(processExitSpy).toHaveBeenCalledWith(1);
    });

    it('should exit the process if a value is supplied for whitelist which has dupes', (): void => {
      EnvConfigValidator.validateEnvironment({
        WEBHOOK_SECRET: 'secret',
        ALGOLIA_API_KEY: 'algolia-api-key',
        ALGOLIA_APPLICATION_ID: 'algolia-application-id',
        ALGOLIA_INDEX_NAME: 'algolia-index-name',
        DC_CLIENT_ID: 'dc-client-id',
        DC_CLIENT_SECRET: 'dc-secret',
        CONTENT_TYPE_WHITELIST: 'http://schema-id1.json;http://schema-id2.json;http://schema-id1.json'
      });
      expect(validateSpy.mock.results[0].value.error).toBeDefined();
      expect(validateSpy.mock.results[0].value.error.details[0].message).toEqual(
        '"CONTENT_TYPE_WHITELIST" position 2 contains a duplicate value'
      );
      expect(processExitSpy).toHaveBeenCalledWith(1);
    });
  });
});
