export class DateRange {
  constructor(
    readonly from: Date,
    readonly to: Date,
  ) {
    if (to < from) {
      throw new Error('DateRange to must be greater than or equal to from');
    }
  }

  contains(date: Date): boolean {
    return date >= this.from && date <= this.to;
  }
}
