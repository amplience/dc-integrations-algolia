import { IsNotEmpty, IsString, ValidateNested } from 'class-validator';

export class SnapshotRootContentItem {
  @IsString()
  @IsNotEmpty()
  public id: string;

  @IsNotEmpty()
  public body: any;
}

export class Snapshot {
  @IsString()
  @IsNotEmpty()
  public id: string;

  @ValidateNested()
  public rootContentItem: SnapshotRootContentItem;
  constructor(data: { id: string; rootContentItem: SnapshotRootContentItem }) {
    Object.assign(this, data);
  }
}
