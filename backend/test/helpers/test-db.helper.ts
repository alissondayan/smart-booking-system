import { PrismaService } from '../../src/shared/infrastructure/database/prisma.service';
import { RedisService } from '../../src/shared/infrastructure/cache/redis.service';

export function createMockPrismaService(): Pick<PrismaService, '$queryRaw'> {
  return {
    $queryRaw: jest.fn().mockResolvedValue([{ '?column?': 1 }]),
  } as unknown as Pick<PrismaService, '$queryRaw'>;
}

export function createMockRedisService(): Pick<RedisService, 'ping'> {
  return {
    ping: jest.fn().mockResolvedValue('PONG'),
  };
}
