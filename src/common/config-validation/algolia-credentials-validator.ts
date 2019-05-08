import * as algoliasearch from 'algoliasearch';
import * as debug from 'debug';

const log = debug('dc-integrations-algolia:algolia-credentials-validator');

export class AlgoliaCredentialsValidator {
  public static async validateCredentials(algoliaConfiguration: { applicationId: string; apiKey: string, algoliaIndex: string }
  ) {
    try {
      const algoliaClient = algoliasearch(algoliaConfiguration.applicationId, algoliaConfiguration.apiKey);
      const algoliaPermissions: { acl: string[], indexes: string[] } = await algoliaClient.getApiKey(algoliaConfiguration.apiKey);

      if (!algoliaPermissions.acl.includes('addObject') || (algoliaPermissions.indexes && !algoliaPermissions.indexes.includes(algoliaConfiguration.algoliaIndex))) {
        log(`APIKey provided does not have the addObject permission for index ${algoliaConfiguration.algoliaIndex}`);
        process.exit(1);
      }

    } catch (err) {
      log('Invalid Algolia credentials', err);
      process.exit(1);
    }
  }
}
