import * as algoliasearch from 'algoliasearch';
import * as debug from 'debug';

const log = debug('dc-integrations-algolia:algolia-credentials-validator');

export class AlgoliaCredentialsValidator {
  public static async validateCredentials(algoliaConfiguration: {
    applicationId: string;
    apiKey: string;
    algoliaIndex: string;
  }): Promise<void> {
    try {
      const algoliaClient = algoliasearch(algoliaConfiguration.applicationId, algoliaConfiguration.apiKey);
      const algoliaPermissions: { acl: string[]; indexes: string[] } = await algoliaClient.getApiKey(
        algoliaConfiguration.apiKey
      );

      if (!algoliaPermissions.acl.includes('addObject')) {
        log(`APIKey provided does not have the addObject permission`);
        process.exit(1);
      }

      if (
        algoliaPermissions.indexes &&
        !this.matchIndexName(algoliaPermissions.indexes, algoliaConfiguration.algoliaIndex)
      ) {
        log(`APIKey provided does not have the permission for index ${algoliaConfiguration.algoliaIndex}`);
        process.exit(1);
      }
    } catch (err) {
      log('Invalid Algolia credentials', err);
      process.exit(1);
    }
  }

  private static matchIndexName(indices: string[], indexName: string): boolean {
    return indices.some(
      (index): boolean => {
        const indexRegex = new RegExp(index.toLowerCase().replace(/^\*|\*$/, '.*'));
        return indexRegex.test(indexName.toLowerCase());
      }
    );
  }
}
