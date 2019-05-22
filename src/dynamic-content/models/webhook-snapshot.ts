import { IsNotEmpty, IsString, ValidateNested } from 'class-validator';

export class SnapshotRootContentItem {
  @IsString()
  @IsNotEmpty()
  public id: string;

  public body: object;
}

export class WebhookSnapshot {
  @IsString()
  @IsNotEmpty()
  public id: string;

  @IsString()
  @IsNotEmpty()
  public createdDate: string;

  @ValidateNested()
  public rootContentItem: SnapshotRootContentItem;

  public constructor(data: { id: string; createdDate: string; rootContentItem: SnapshotRootContentItem }) {
    Object.assign(this, data);
  }
}
