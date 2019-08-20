import * as Joi from '@hapi/joi';
import * as debug from 'debug';

const log = debug('dc-integrations-algolia:env-config-validator');

export interface EnvConfig {
  [key: string]: string;
}

export class EnvConfigValidator {
  public static validateEnvironment(envConfig: EnvConfig): void {
    const configToValidate: { [key: string]: string | string[] } = {
      ...envConfig,
      DC_CONTENT_TYPE_WHITELIST: envConfig.DC_CONTENT_TYPE_WHITELIST
        ? envConfig.DC_CONTENT_TYPE_WHITELIST.split(';')
        : [],
      DC_CONTENT_TYPE_PROPERTY_WHITELIST: envConfig.DC_CONTENT_TYPE_PROPERTY_WHITELIST
        ? envConfig.DC_CONTENT_TYPE_PROPERTY_WHITELIST.split(';')
        : []
    };

    const envSchema = Joi.object()
      .keys({
        DC_WEBHOOK_SECRET: Joi.string().required(),
        ALGOLIA_WRITE_API_KEY: Joi.string().required(),
        ALGOLIA_APPLICATION_ID: Joi.string().required(),
        ALGOLIA_INDEX_NAME: Joi.string().required(),
        DC_CLIENT_ID: Joi.string().required(),
        DC_CLIENT_SECRET: Joi.string().required(),
        DC_CONTENT_TYPE_WHITELIST: Joi.array()
          .unique()
          .optional(),
        DC_CONTENT_TYPE_PROPERTY_WHITELIST: Joi.array()
          .unique()
          .optional()
      })
      .unknown();
    const result = Joi.validate(configToValidate, envSchema);

    if (result.error !== null) {
      const envErrors = result.error.details.map((detail): string => detail.message);
      log('Environment configuration error:', ...envErrors);
      process.exit(1);
    }
  }
}
