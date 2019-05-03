import * as Joi from '@hapi/joi';

export interface EnvConfig {
  [key: string]: string;
}

export class EnvConfigValidator {
  public static validateEnvironment(envConfig: EnvConfig): void {
    const envSchema = Joi.object()
      .keys({
        ALGOLIA_API_KEY: Joi.string().required(),
        ALGOLIA_APP_ID: Joi.string().required(),
        ALGOLIA_INDEX_NAME: Joi.string().required(),
        DC_CLIENT_ID: Joi.string().required(),
        DC_SECRET: Joi.string().required()
      })
      .unknown();
    const result = Joi.validate(envConfig, envSchema);

    if (result.error !== null) {
      const envErrors = result.error.details.map(detail => detail.message);
      console.log('Environment configuration error:', ...envErrors);
      process.exit(1);
    }
  }
}
