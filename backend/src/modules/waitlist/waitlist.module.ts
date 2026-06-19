import { Module } from '@nestjs/common';
import { CatalogModule } from '../catalog/catalog.module';
import { JoinWaitlistUseCase } from './application/join-waitlist.use-case';
import { ListWaitlistUseCase } from './application/list-waitlist.use-case';
import { ProcessWaitlistOnCancelHandler } from './application/process-waitlist-on-cancel.handler';
import { WAITLIST_REPOSITORY } from './domain/ports/waitlist.repository.port';
import { PrismaWaitlistRepository } from './infrastructure/persistence/prisma-waitlist.repository';
import { AdminWaitlistController } from './presentation/admin-waitlist.controller';
import { WaitlistController } from './presentation/waitlist.controller';

@Module({
  imports: [CatalogModule],
  controllers: [WaitlistController, AdminWaitlistController],
  providers: [
    JoinWaitlistUseCase,
    ListWaitlistUseCase,
    ProcessWaitlistOnCancelHandler,
    {
      provide: WAITLIST_REPOSITORY,
      useClass: PrismaWaitlistRepository,
    },
  ],
  exports: [WAITLIST_REPOSITORY],
})
export class WaitlistModule {}
