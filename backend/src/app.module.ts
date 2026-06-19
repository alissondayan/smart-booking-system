import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { HealthModule } from './modules/health/health.module';
import { PrismaModule } from './shared/infrastructure/database/prisma.module';
import { RedisModule } from './shared/infrastructure/cache/redis.module';
import { BullMqInfrastructureModule } from './shared/infrastructure/queue/bullmq.module';
import { EventBusModule } from './shared/infrastructure/event-bus/event-bus.module';
import { IdentityModule } from './modules/identity/identity.module';
import { BusinessModule } from './modules/business/business.module';
import { CatalogModule } from './modules/catalog/catalog.module';
import { SchedulingModule } from './modules/scheduling/scheduling.module';
import { CustomersModule } from './modules/customers/customers.module';
import { WaitlistModule } from './modules/waitlist/waitlist.module';
import { NotificationsModule } from './modules/notifications/notifications.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', '.env.local'],
    }),
    PrismaModule,
    RedisModule,
    BullMqInfrastructureModule,
    EventBusModule,
    HealthModule,
    IdentityModule,
    BusinessModule,
    CatalogModule,
    SchedulingModule,
    CustomersModule,
    WaitlistModule,
    NotificationsModule,
  ],
})
export class AppModule {}
