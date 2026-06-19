import { AvailabilityRuleEntity } from '../entities/availability-rule.entity';
import { BlockedTimeEntity } from '../entities/blocked-time.entity';
import { DateAvailabilityEntity } from '../entities/date-availability.entity';
import { HolidayEntity } from '../entities/holiday.entity';

export const AVAILABILITY_REPOSITORY = Symbol('AVAILABILITY_REPOSITORY');

export interface SetAvailabilityRuleData {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  isActive?: boolean;
}

export interface SetDateAvailabilityData {
  date: Date;
  startTime: string;
  endTime: string;
  isClosed?: boolean;
}

export interface CreateBlockedTimeData {
  startAt: Date;
  endAt: Date;
  reason?: string | null;
}

export interface CreateHolidayData {
  date: Date;
  label?: string | null;
}

export interface AvailabilityRepositoryPort {
  listRules(): Promise<AvailabilityRuleEntity[]>;
  replaceRules(rules: SetAvailabilityRuleData[]): Promise<AvailabilityRuleEntity[]>;
  findRuleByDayOfWeek(dayOfWeek: number): Promise<AvailabilityRuleEntity | null>;
  listDateAvailabilities(from?: Date, to?: Date): Promise<DateAvailabilityEntity[]>;
  findDateAvailability(date: Date): Promise<DateAvailabilityEntity | null>;
  setDateAvailability(data: SetDateAvailabilityData): Promise<DateAvailabilityEntity>;
  deleteDateAvailability(date: Date): Promise<void>;
  listBlockedTimes(from?: Date, to?: Date): Promise<BlockedTimeEntity[]>;
  listBlockedTimesOverlapping(from: Date, to: Date): Promise<BlockedTimeEntity[]>;
  createBlockedTime(data: CreateBlockedTimeData): Promise<BlockedTimeEntity>;
  deleteBlockedTime(id: string): Promise<void>;
  listHolidays(): Promise<HolidayEntity[]>;
  findHoliday(date: Date): Promise<HolidayEntity | null>;
  createHoliday(data: CreateHolidayData): Promise<HolidayEntity>;
  deleteHoliday(id: string): Promise<void>;
}
