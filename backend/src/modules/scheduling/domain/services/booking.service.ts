import { TimeSlot } from '../../../../shared/domain/value-objects/time-slot.vo';

export class BookingService {
  assertFutureSlot(startAt: Date): void {
    if (startAt <= new Date()) {
      throw new Error('Appointment must be scheduled in the future');
    }
  }

  createSlot(startAt: Date, durationMinutes: number): TimeSlot {
    return new TimeSlot(
      startAt,
      new Date(startAt.getTime() + durationMinutes * 60_000),
    );
  }
}
