import * as Joi from '@hapi/joi';
import * as debug from 'debug';

const log = debug('dc-integrations-algolia:env-config-validator');

export interface EnvConfig {
  [key: string]: string;
}

export class EnvConfigValidator {
  public static validateEnvironment(envConfig: EnvConfig): void {
    const envSchema = Joi.object()
      .keys({
        WEBHOOK_SECRET: Joi.string().required(),
        ALGOLIA_API_KEY: Joi.string().required(),
        ALGOLIA_APPLICATION_ID: Joi.string().required(),
        ALGOLIA_INDEX_NAME: Joi.string().required(),
        DC_CLIENT_ID: Joi.string().required(),
        DC_CLIENT_SECRET: Joi.string().required(),
        CONTENT_TYPE_WHITE_LIST: Joi.string().required()
      })
      .unknown();
    const result = Joi.validate(envConfig, envSchema);

    if (result.error !== null) {
      const envErrors = result.error.details.map((detail): string => detail.message);
      log('Environment configuration error:', ...envErrors);
      process.exit(1);
    }
  }
}
