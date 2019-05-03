import { Snapshot } from './snapshot';
import { IsNotEmpty, IsString, ValidateNested } from 'class-validator';

export class WebhookRequest {
  constructor(data: { name?: string; payload?: Snapshot }) {
    Object.assign(this, data);
  }

  @IsNotEmpty()
  @IsString()
  name: string;

  @ValidateNested()
  @IsNotEmpty()
  payload: Snapshot;
}
