import { TimeSlot } from '../../../../shared/domain/value-objects/time-slot.vo';
import { AvailabilityRuleEntity } from '../entities/availability-rule.entity';
import { SlotStrategy } from '../ports/slot-strategy.port';
import {
  CalculateSlotsInput,
  SlotCalculatorService,
} from './slot-calculator.service';

const SERVICE_ID = 'service-id';
const TIMEZONE = 'Asia/Jerusalem';
/** A Wednesday, when Asia/Jerusalem observes UTC+3, so 06:00 local is 03:00Z. */
const DATE = '2026-09-02';
const DAY_OF_WEEK = 3;
const DURATION_MINUTES = 30;
const FIXED_DATE = new Date('2026-01-01T00:00:00.000Z');

const ALL_DAY_SLOTS = [
  '2026-09-02T03:00:00.000Z',
  '2026-09-02T03:30:00.000Z',
  '2026-09-02T04:00:00.000Z',
  '2026-09-02T04:30:00.000Z',
  '2026-09-02T05:00:00.000Z',
  '2026-09-02T05:30:00.000Z',
  '2026-09-02T06:00:00.000Z',
  '2026-09-02T06:30:00.000Z',
  '2026-09-02T07:00:00.000Z',
  '2026-09-02T07:30:00.000Z',
  '2026-09-02T08:00:00.000Z',
  '2026-09-02T08:30:00.000Z',
];

const passthroughStrategy: SlotStrategy = {
  rankSlots: (context) => [...context.slots],
};

function buildRule(): AvailabilityRuleEntity {
  return new AvailabilityRuleEntity({
    id: 'rule-id',
    dayOfWeek: DAY_OF_WEEK,
    startTime: '06:00',
    endTime: '12:00',
    isActive: true,
    createdAt: FIXED_DATE,
    updatedAt: FIXED_DATE,
  });
}

function buildInput(
  overrides: Partial<CalculateSlotsInput> = {},
): CalculateSlotsInput {
  return {
    serviceId: SERVICE_ID,
    date: DATE,
    timezone: TIMEZONE,
    now: new Date('2026-09-02T05:00:00.000Z'),
    durationMinutes: DURATION_MINUTES,
    rule: buildRule(),
    dateAvailability: null,
    holiday: null,
    blockedTimes: [],
    appointments: [],
    slotStrategy: passthroughStrategy,
    ...overrides,
  };
}

function startTimes(slots: TimeSlot[]): string[] {
  return slots.map((slot) => slot.startAt.toISOString());
}

describe('SlotCalculatorService', () => {
  const calculator = new SlotCalculatorService();

  it('excludes slots on the current day whose start time has already passed', () => {
    // 05:00Z is 08:00 in Asia/Jerusalem, so the 06:00-08:00 local slots are gone.
    const slots = calculator.calculate(
      buildInput({ now: new Date('2026-09-02T05:00:00.000Z') }),
    );

    expect(startTimes(slots)).not.toContain('2026-09-02T03:00:00.000Z');
    expect(startTimes(slots)).not.toContain('2026-09-02T04:30:00.000Z');
    // A slot starting exactly at `now` is not bookable either.
    expect(startTimes(slots)).not.toContain('2026-09-02T05:00:00.000Z');
  });

  it('keeps slots on the current day that are still in the future', () => {
    const slots = calculator.calculate(
      buildInput({ now: new Date('2026-09-02T05:00:00.000Z') }),
    );

    expect(startTimes(slots)).toEqual([
      '2026-09-02T05:30:00.000Z',
      '2026-09-02T06:00:00.000Z',
      '2026-09-02T06:30:00.000Z',
      '2026-09-02T07:00:00.000Z',
      '2026-09-02T07:30:00.000Z',
      '2026-09-02T08:00:00.000Z',
      '2026-09-02T08:30:00.000Z',
    ]);
  });

  it('returns no slots once the working day has fully elapsed', () => {
    // Reported scenario: an afternoon request still listed that morning's slots.
    const slots = calculator.calculate(
      buildInput({ now: new Date('2026-09-02T13:00:00.000Z') }),
    );

    expect(slots).toEqual([]);
  });

  it('leaves slots on future dates untouched', () => {
    const slots = calculator.calculate(
      buildInput({ now: new Date('2026-09-01T13:00:00.000Z') }),
    );

    expect(startTimes(slots)).toEqual(ALL_DAY_SLOTS);
  });
});
