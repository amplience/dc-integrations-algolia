import * as Joi from '@hapi/joi';
import {EnvConfigValidator} from "./env-config-validator";

describe('env-config-validator', () => {
  let processExitSpy;
  let validateSpy;

  beforeEach(() => {
    validateSpy = jest.spyOn(Joi, 'validate');
    processExitSpy = jest.spyOn(process, 'exit').mockImplementation();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  afterAll(() => {
    jest.resetAllMocks();
  })

  describe('validEnvironment() - success', () => {
    it('should pass through when all required config values exist', () => {
      EnvConfigValidator.validateEnvironment({
        DC_CLIENT_ID: 'dc-client-id',
        DC_SECRET: 'dc-secret',
        ALGOLIA_APP_ID: 'algolia-app-id',
        ALGOLIA_API_KEY: 'algolia-api-key',
        ALGOLIA_INDEX_NAME: 'algolia-index-name'
      });
      expect(validateSpy.mock.results[0].value.error).toBe(null);
      expect(processExitSpy).toHaveBeenCalledTimes(0);
    });
    it('should pass through when all required config values exist and ignore unknown value', () => {
      EnvConfigValidator.validateEnvironment({
        DC_CLIENT_ID: 'dc-client-id',
        DC_SECRET: 'dc-secret',
        ALGOLIA_APP_ID: 'algolia-app-id',
        ALGOLIA_API_KEY: 'algolia-api-key',
        ALGOLIA_INDEX_NAME: 'algolia-index-name',
        IGNORE_ME: 'im-not-here'
      });
      expect(validateSpy.mock.results[0].value.error).toBe(null);
      expect(processExitSpy).toHaveBeenCalledTimes(0);
    });
  });
  describe('validEnvironment() - fail', () => {
    it('should exit the process if a required config value is missing', () => {
      EnvConfigValidator.validateEnvironment({
        DC_CLIENT_ID: 'dc-client-id',
        ALGOLIA_APP_ID: 'algolia-app-id',
        ALGOLIA_API_KEY: 'algolia-api-key',
        ALGOLIA_INDEX_NAME: 'algolia-index-name'
      });
      expect(validateSpy.mock.results[0].value.error).toBeDefined();
      expect(validateSpy.mock.results[0].value.error.details[0].message).toEqual('"DC_SECRET" is required');
      expect(processExitSpy).toHaveBeenCalledWith(1);
    });
    it('should exit the process if a required config value is empty', () => {
      EnvConfigValidator.validateEnvironment({
        DC_CLIENT_ID: 'dc-client-id',
        DC_SECRET: '',
        ALGOLIA_APP_ID: 'algolia-app-id',
        ALGOLIA_API_KEY: 'algolia-api-key',
        ALGOLIA_INDEX_NAME: 'algolia-index-name'
      });
      expect(validateSpy.mock.results[0].value.error).toBeDefined();
      expect(validateSpy.mock.results[0].value.error.details[0].message).toEqual('"DC_SECRET" is not allowed to be empty');
      expect(processExitSpy).toHaveBeenCalledWith(1);
    });
  });
});
