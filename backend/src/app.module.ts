import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { HealthModule } from './modules/health/health.module';
import { PrismaModule } from './shared/infrastructure/database/prisma.module';
import { RedisModule } from './shared/infrastructure/cache/redis.module';
import { BullMqInfrastructureModule } from './shared/infrastructure/queue/bullmq.module';
import { IdentityModule } from './modules/identity/identity.module';
import { BusinessModule } from './modules/business/business.module';
import { CatalogModule } from './modules/catalog/catalog.module';
import { SchedulingModule } from './modules/scheduling/scheduling.module';
import { CustomersModule } from './modules/customers/customers.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', '.env.local'],
    }),
    PrismaModule,
    RedisModule,
    BullMqInfrastructureModule,
    HealthModule,
    IdentityModule,
    BusinessModule,
    CatalogModule,
    SchedulingModule,
    CustomersModule,
  ],
})
export class AppModule {}
