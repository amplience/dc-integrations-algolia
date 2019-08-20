import * as debug from 'debug';
import * as dotenv from 'dotenv';
import 'reflect-metadata';
import { AlgoliaCredentialsValidator } from './common/config-validation/algolia-credentials-validator';
import { DcCredentialsValidator } from './common/config-validation/dc-credentials-validator';
import { EnvConfigValidator } from './common/config-validation/env-config-validator';
import getApp from './express-application';

const log = debug('dc-integrations-algolia:app');

(async (): Promise<void> => {
  dotenv.config();
  const PORT: number = Number(process.env.PORT) || 3000;

  EnvConfigValidator.validateEnvironment(process.env);
  log('Validating credentials');
  await DcCredentialsValidator.validateCredentials(
    { clientId: process.env.DC_CLIENT_ID, clientSecret: process.env.DC_CLIENT_SECRET },
    { authUrl: process.env.DC_AUTH_URL, apiUrl: process.env.DC_API_URL }
  );

  await AlgoliaCredentialsValidator.validateCredentials({
    apiKey: process.env.ALGOLIA_WRITE_API_KEY,
    applicationId: process.env.ALGOLIA_APPLICATION_ID,
    algoliaIndex: process.env.ALGOLIA_INDEX_NAME
  });

  log('Credentials validated');

  const app = getApp();
  app.listen(PORT, (): void => log(`Listening on port ${PORT}!`));
})().catch(
  (err): void => {
    log('Unexpected error whilst setting up app', err);
  }
);
