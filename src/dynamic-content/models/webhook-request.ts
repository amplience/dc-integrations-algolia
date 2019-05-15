import { IsNotEmpty, IsString, ValidateNested } from 'class-validator';
import { WebhookSnapshot } from './webhook-snapshot';

export class WebhookRequest {
  @IsNotEmpty()
  @IsString()
  public name: string;

  @ValidateNested()
  @IsNotEmpty()
  public payload: WebhookSnapshot;
  public constructor(data: { name?: string; payload?: WebhookSnapshot }) {
    Object.assign(this, data);
  }
}
