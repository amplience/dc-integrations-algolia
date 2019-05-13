import { IsNotEmpty, IsString, ValidateNested } from 'class-validator';

export class SnapshotRootContentItem {
  @IsString()
  @IsNotEmpty()
  public id: string;

  public body: object;
}

export class Snapshot {
  @IsString()
  @IsNotEmpty()
  public id: string;

  @ValidateNested()
  public rootContentItem: SnapshotRootContentItem;

  public constructor(data: { id: string; rootContentItem: SnapshotRootContentItem }) {
    Object.assign(this, data);
  }
}
