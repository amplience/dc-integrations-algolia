import {DynamicContent} from "dc-management-sdk-js";

export class DynamicContentService {
  private dcClient: DynamicContent;

  constructor(clientId: string, clientSecret: string) {
    this.dcClient = new DynamicContent({client_id: clientId, client_secret: clientSecret});
  }

  async validateWebhookSecret(webhookSecret: string): Promise<boolean> {
    return true;
  }
}
