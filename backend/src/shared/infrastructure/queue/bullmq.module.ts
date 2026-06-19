import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';

function parseRedisConnection(redisUrl: string): {
  host: string;
  port: number;
  password?: string;
} {
  const parsedUrl = new URL(redisUrl);

  return {
    host: parsedUrl.hostname,
    port: Number(parsedUrl.port || 6379),
    password: parsedUrl.password || undefined,
  };
}

@Module({
  imports: [
    BullModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        connection: parseRedisConnection(
          configService.get<string>('REDIS_URL') ?? 'redis://localhost:6379',
        ),
      }),
    }),
  ],
  exports: [BullModule],
})
export class BullMqInfrastructureModule {}
