import { DynamicContent } from 'dc-management-sdk-js';
import * as debug from 'debug';

const log = debug('dc-integrations-algolia:dc-credentials-validator');

export class DcCredentialsValidator {
  public static async validateCredentials(
    dcCredentials: { clientId: string; clientSecret: string },
    dcConfig: { authUrl: string; apiUrl: string }
  ) {
    try {
      const dcClient = new DynamicContent(
        { client_id: dcCredentials.clientId, client_secret: dcCredentials.clientSecret },
        dcConfig
      );
      await dcClient.hubs.list();
    } catch (err) {
      log('Invalid DC credentials', err);
      process.exit(1);
    }
  }
}
