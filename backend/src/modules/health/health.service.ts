import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../shared/infrastructure/database/prisma.service';
import { RedisService } from '../../shared/infrastructure/cache/redis.service';

export interface HealthCheckResult {
  status: 'ok';
  checks: {
    database: 'ok';
    redis: 'ok';
  };
  timestamp: string;
}

@Injectable()
export class HealthService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly redisService: RedisService,
  ) {}

  async check(): Promise<HealthCheckResult> {
    await this.prismaService.$queryRaw`SELECT 1`;
    await this.redisService.ping();

    return {
      status: 'ok',
      checks: {
        database: 'ok',
        redis: 'ok',
      },
      timestamp: new Date().toISOString(),
    };
  }
}
