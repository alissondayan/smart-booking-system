import { BullModule, getQueueToken } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { CatalogModule } from '../catalog/catalog.module';
import { IdentityModule } from '../identity/identity.module';
import { EMAIL_NOTIFICATIONS_QUEUE } from '../../shared/infrastructure/queue/queue.constants';
import { SendBookingConfirmationHandler } from './application/send-booking-confirmation.handler';
import { SendCancellationConfirmationHandler } from './application/send-cancellation-confirmation.handler';
import { EMAIL_PORT } from './domain/ports/email.port';
import { NodemailerAdapter } from './infrastructure/email/nodemailer.adapter';
import { EmailProcessor } from './infrastructure/queue/email.processor';

const isTestEnvironment = process.env.NODE_ENV === 'test';

@Module({
  imports: [
    IdentityModule,
    CatalogModule,
    ...(isTestEnvironment
      ? []
      : [
          BullModule.registerQueue({
            name: EMAIL_NOTIFICATIONS_QUEUE,
          }),
        ]),
  ],
  providers: [
    SendBookingConfirmationHandler,
    SendCancellationConfirmationHandler,
    ...(isTestEnvironment
      ? [
          {
            provide: getQueueToken(EMAIL_NOTIFICATIONS_QUEUE),
            useValue: {
              add: async () => undefined,
            },
          },
        ]
      : [EmailProcessor]),
    {
      provide: EMAIL_PORT,
      useClass: NodemailerAdapter,
    },
  ],
  exports: [EMAIL_PORT],
})
export class NotificationsModule {}
