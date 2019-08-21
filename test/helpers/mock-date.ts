let _originalDate_;
const mockedDate = new Date('2019-07-15T00:00:00.000Z');

export function setup(): void {
  _originalDate_ = global.Date;

  // @ts-ignore-next-line
  global.Date = class extends Date {
    public constructor(dateToLoad?: string | number) {
      if (dateToLoad) {
        super(dateToLoad);
        return this;
      }

      return mockedDate;
    }
  };
}

export function restore(): void {
  global.Date = _originalDate_;
}
