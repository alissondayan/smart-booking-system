import { BullModule, getQueueToken } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { EMAIL_NOTIFICATIONS_QUEUE } from '../../shared/infrastructure/queue/queue.constants';
import { CatalogModule } from '../catalog/catalog.module';
import { IdentityModule } from '../identity/identity.module';
import { JoinWaitlistUseCase } from './application/join-waitlist.use-case';
import { ListWaitlistUseCase } from './application/list-waitlist.use-case';
import { ProcessWaitlistOnCancelHandler } from './application/process-waitlist-on-cancel.handler';
import { WAITLIST_REPOSITORY } from './domain/ports/waitlist.repository.port';
import { PrismaWaitlistRepository } from './infrastructure/persistence/prisma-waitlist.repository';
import { AdminWaitlistController } from './presentation/admin-waitlist.controller';
import { WaitlistController } from './presentation/waitlist.controller';

const isTestEnvironment = process.env.NODE_ENV === 'test';

@Module({
  imports: [
    CatalogModule,
    IdentityModule,
    ...(isTestEnvironment
      ? []
      : [BullModule.registerQueue({ name: EMAIL_NOTIFICATIONS_QUEUE })]),
  ],
  controllers: [WaitlistController, AdminWaitlistController],
  providers: [
    JoinWaitlistUseCase,
    ListWaitlistUseCase,
    ProcessWaitlistOnCancelHandler,
    {
      provide: WAITLIST_REPOSITORY,
      useClass: PrismaWaitlistRepository,
    },
    ...(isTestEnvironment
      ? [
          {
            provide: getQueueToken(EMAIL_NOTIFICATIONS_QUEUE),
            useValue: {
              add: async () => undefined,
            },
          },
        ]
      : []),
  ],
  exports: [WAITLIST_REPOSITORY],
})
export class WaitlistModule {}
