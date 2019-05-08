import { IsNotEmpty, IsString, ValidateNested } from 'class-validator';
import { Snapshot } from './snapshot';

export class WebhookRequest {
  @IsNotEmpty()
  @IsString()
  public name: string;

  @ValidateNested()
  @IsNotEmpty()
  public payload: Snapshot;
  public constructor(data: { name?: string; payload?: Snapshot }) {
    Object.assign(this, data);
  }
}
