import { IsNotEmpty, IsString, ValidateNested } from 'class-validator';

class SnapshotRootContentItem {
  @IsString()
  @IsNotEmpty()
  id: string;
}

export class Snapshot {
  constructor(data: { id: string; rootContentItem: SnapshotRootContentItem }) {
    Object.assign(this, data);
  }

  @IsString()
  @IsNotEmpty()
  id: string;

  @ValidateNested()
  rootContentItem: SnapshotRootContentItem;
}
