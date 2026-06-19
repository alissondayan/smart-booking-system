import { TimeSlot } from '../../../../shared/domain/value-objects/time-slot.vo';
import { AppointmentEntity } from '../entities/appointment.entity';
import { AvailabilityRuleEntity } from '../entities/availability-rule.entity';
import { BlockedTimeEntity } from '../entities/blocked-time.entity';
import { DateAvailabilityEntity } from '../entities/date-availability.entity';
import { HolidayEntity } from '../entities/holiday.entity';
import { SlotStrategy } from '../ports/slot-strategy.port';

export interface CalculateSlotsInput {
  serviceId: string;
  date: string;
  timezone: string;
  durationMinutes: number;
  rule: AvailabilityRuleEntity | null;
  dateAvailability: DateAvailabilityEntity | null;
  holiday: HolidayEntity | null;
  blockedTimes: BlockedTimeEntity[];
  appointments: AppointmentEntity[];
  slotStrategy: SlotStrategy;
}

export class SlotCalculatorService {
  calculate(input: CalculateSlotsInput): TimeSlot[] {
    if (input.holiday) {
      return [];
    }

    const workingHours = this.resolveWorkingHours(input);

    if (!workingHours) {
      return [];
    }

    const slots = this.generateSlots(
      input.date,
      workingHours.startTime,
      workingHours.endTime,
      input.timezone,
      input.durationMinutes,
    ).filter(
      (slot) =>
        !this.overlapsAny(slot, input.blockedTimes) &&
        !this.overlapsAny(slot, input.appointments),
    );

    return input.slotStrategy.rankSlots({
      serviceId: input.serviceId,
      date: input.date,
      slots,
    });
  }

  private resolveWorkingHours(input: CalculateSlotsInput): {
    startTime: string;
    endTime: string;
  } | null {
    if (input.dateAvailability) {
      const override = input.dateAvailability.toJSON();

      return override.isClosed
        ? null
        : { startTime: override.startTime, endTime: override.endTime };
    }

    if (!input.rule) {
      return null;
    }

    const rule = input.rule.toJSON();

    return rule.isActive
      ? { startTime: rule.startTime, endTime: rule.endTime }
      : null;
  }

  private generateSlots(
    date: string,
    startTime: string,
    endTime: string,
    timezone: string,
    durationMinutes: number,
  ): TimeSlot[] {
    const slots: TimeSlot[] = [];
    let cursor = this.toUtcDate(date, startTime, timezone);
    const workingEnd = this.toUtcDate(date, endTime, timezone);

    while (cursor < workingEnd) {
      const slotEnd = new Date(cursor.getTime() + durationMinutes * 60_000);

      if (slotEnd > workingEnd) {
        break;
      }

      slots.push(new TimeSlot(cursor, slotEnd));
      cursor = slotEnd;
    }

    return slots;
  }

  private overlapsAny(
    slot: TimeSlot,
    ranges: Array<BlockedTimeEntity | AppointmentEntity>,
  ): boolean {
    return ranges.some((range) => {
      const rangeJson = range.toJSON();

      return slot.overlaps(new TimeSlot(rangeJson.startAt, rangeJson.endAt));
    });
  }

  private toUtcDate(date: string, time: string, timezone: string): Date {
    const [year, month, day] = date.split('-').map(Number);
    const [hours, minutes] = time.split(':').map(Number);
    const intendedUtc = Date.UTC(year, month - 1, day, hours, minutes);
    const localized = new Intl.DateTimeFormat('en-CA', {
      timeZone: timezone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }).formatToParts(new Date(intendedUtc));
    const value = (type: string) =>
      Number(localized.find((part) => part.type === type)?.value);
    const localizedUtc = Date.UTC(
      value('year'),
      value('month') - 1,
      value('day'),
      value('hour'),
      value('minute'),
    );

    return new Date(intendedUtc - (localizedUtc - intendedUtc));
  }
}
