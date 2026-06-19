import { Injectable } from '@nestjs/common';
import { RedisService } from '../../../../shared/infrastructure/cache/redis.service';
import { SlotHoldPort } from '../../domain/ports/slot-hold.port';

const SLOT_HOLD_TTL_SECONDS = 180;

@Injectable()
export class RedisSlotHoldAdapter implements SlotHoldPort {
  constructor(private readonly redisService: RedisService) {}

  async acquire(serviceId: string, startAt: Date): Promise<boolean> {
    const result = await this.redisService
      .getClient()
      .set(this.key(serviceId, startAt), '1', 'EX', SLOT_HOLD_TTL_SECONDS, 'NX');

    return result === 'OK';
  }

  async release(serviceId: string, startAt: Date): Promise<void> {
    await this.redisService.getClient().del(this.key(serviceId, startAt));
  }

  private key(serviceId: string, startAt: Date): string {
    return `slot-hold:${serviceId}:${startAt.toISOString()}`;
  }
}
