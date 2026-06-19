import { AppointmentProps } from '../domain/entities/appointment.entity';
import { AvailabilityRuleProps } from '../domain/entities/availability-rule.entity';
import { BlockedTimeProps } from '../domain/entities/blocked-time.entity';
import { DateAvailabilityProps } from '../domain/entities/date-availability.entity';
import { HolidayProps } from '../domain/entities/holiday.entity';

export type AppointmentResponse = AppointmentProps;
export type AvailabilityRuleResponse = AvailabilityRuleProps;
export type DateAvailabilityResponse = DateAvailabilityProps;
export type BlockedTimeResponse = BlockedTimeProps;
export type HolidayResponse = HolidayProps;

export interface SlotResponse {
  startAt: Date;
  endAt: Date;
}
