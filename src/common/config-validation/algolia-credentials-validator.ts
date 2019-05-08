import * as debug from 'debug';
import * as algoliasearch from 'algoliasearch';

const log = debug('dc-integrations-algolia:algolia-credentials-validator');

export class AlgoliaCredentialsValidator {
  public static async validateCredentials (
    algoliaCredentials: { applicationId: string, apiKey: string }
  ) {
    try {
      const algoliaClient = algoliasearch(algoliaCredentials.applicationId, algoliaCredentials.apiKey);
      const algoliaIndexes = await algoliaClient.listIndexes();

      log(algoliaIndexes);
    } catch (err) {
      log('Invalid Algolia credentials', err);
      process.exit(1);
    }
  }
}
