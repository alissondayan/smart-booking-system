export class TimeSlot {
  constructor(
    readonly startAt: Date,
    readonly endAt: Date,
  ) {
    if (endAt <= startAt) {
      throw new Error('TimeSlot endAt must be after startAt');
    }
  }

  overlaps(other: TimeSlot): boolean {
    return this.startAt < other.endAt && other.startAt < this.endAt;
  }
}
