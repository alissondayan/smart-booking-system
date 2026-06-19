import { Injectable } from '@nestjs/common';
import {
  SlotRankingContext,
  SlotStrategy,
  RankedSlot,
} from '../../domain/ports/slot-strategy.port';

@Injectable()
export class SimpleSlotStrategy implements SlotStrategy {
  rankSlots(context: SlotRankingContext): RankedSlot[] {
    return [...context.slots].sort(
      (left, right) => left.startAt.getTime() - right.startAt.getTime(),
    );
  }
}
