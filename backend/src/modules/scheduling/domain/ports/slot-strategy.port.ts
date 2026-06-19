import { TimeSlot } from '../../../../shared/domain/value-objects/time-slot.vo';

export const SLOT_STRATEGY = Symbol('SLOT_STRATEGY');

export interface SlotRankingContext {
  serviceId: string;
  date: string;
  slots: TimeSlot[];
}

export type RankedSlot = TimeSlot;

export interface SlotStrategy {
  rankSlots(context: SlotRankingContext): RankedSlot[];
}
