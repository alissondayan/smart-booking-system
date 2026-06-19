import { BullModule, getQueueToken } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { BusinessModule } from '../business/business.module';
import { CatalogModule } from '../catalog/catalog.module';
import { SchedulingModule } from '../scheduling/scheduling.module';
import { CALENDAR_SYNC_QUEUE } from '../../shared/infrastructure/queue/queue.constants';
import { EncryptionService } from '../../shared/infrastructure/crypto/encryption.service';
import { ConnectGoogleCalendarUseCase } from './application/connect-google-calendar.use-case';
import { GenerateIcsUseCase } from './application/generate-ics.use-case';
import { RemoveAppointmentFromCalendarHandler } from './application/remove-appointment-from-calendar.handler';
import { SyncAppointmentToCalendarHandler } from './application/sync-appointment-to-calendar.handler';
import { CALENDAR_INTEGRATION_REPOSITORY } from './domain/ports/calendar-integration.repository.port';
import { CALENDAR_PORT } from './domain/ports/calendar.port';
import { GOOGLE_CALENDAR_OAUTH_PORT } from './domain/ports/google-calendar-oauth.port';
import { GoogleCalendarAdapter } from './infrastructure/google/google-calendar.adapter';
import { IcsGeneratorService } from './infrastructure/ics/ics-generator.service';
import { PrismaCalendarIntegrationRepository } from './infrastructure/persistence/prisma-calendar-integration.repository';
import { CalendarSyncProcessor } from './infrastructure/queue/calendar-sync.processor';
import { CalendarController } from './presentation/calendar.controller';
import { IcsController } from './presentation/ics.controller';

const isTestEnvironment = process.env.NODE_ENV === 'test';

@Module({
  imports: [
    BusinessModule,
    CatalogModule,
    SchedulingModule,
    ...(isTestEnvironment
      ? []
      : [BullModule.registerQueue({ name: CALENDAR_SYNC_QUEUE })]),
  ],
  controllers: [CalendarController, IcsController],
  providers: [
    EncryptionService,
    ConnectGoogleCalendarUseCase,
    GenerateIcsUseCase,
    SyncAppointmentToCalendarHandler,
    RemoveAppointmentFromCalendarHandler,
    IcsGeneratorService,
    GoogleCalendarAdapter,
    ...(isTestEnvironment
      ? [
          {
            provide: getQueueToken(CALENDAR_SYNC_QUEUE),
            useValue: { add: async () => undefined },
          },
        ]
      : [CalendarSyncProcessor]),
    {
      provide: CALENDAR_INTEGRATION_REPOSITORY,
      useClass: PrismaCalendarIntegrationRepository,
    },
    {
      provide: CALENDAR_PORT,
      useExisting: GoogleCalendarAdapter,
    },
    {
      provide: GOOGLE_CALENDAR_OAUTH_PORT,
      useExisting: GoogleCalendarAdapter,
    },
  ],
})
export class IntegrationsModule {}
