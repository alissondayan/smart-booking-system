import { Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { EVENT_BUS, EventBusPort } from '../../../shared/application/event-bus.port';
import { EMAIL_NOTIFICATIONS_QUEUE } from '../../../shared/infrastructure/queue/queue.constants';
import { ServiceEntity } from '../../catalog/domain/entities/service.entity';
import {
  SERVICE_REPOSITORY,
  ServiceRepositoryPort,
} from '../../catalog/domain/ports/service.repository.port';
import { UserEntity } from '../../identity/domain/entities/user.entity';
import {
  USER_REPOSITORY,
  UserRepositoryPort,
} from '../../identity/domain/ports/user.repository.port';
import { EmailJobName, SendEmailJob } from '../../notifications/infrastructure/queue/email.job.types';
import { waitlistSlotAvailableTemplate } from '../../notifications/infrastructure/templates/waitlist-slot-available.template';
import { AppointmentCancelledEvent } from '../../scheduling/domain/events/appointment-cancelled.event';
import { WaitlistEntryEntity } from '../domain/entities/waitlist-entry.entity';
import {
  WAITLIST_REPOSITORY,
  WaitlistRepositoryPort,
} from '../domain/ports/waitlist.repository.port';

export const WAITLIST_CLAIM_ATTEMPTS = 5;

@Injectable()
export class ProcessWaitlistOnCancelHandler implements OnModuleInit {
  private readonly logger = new Logger(ProcessWaitlistOnCancelHandler.name);

  constructor(
    @Inject(EVENT_BUS)
    private readonly eventBus: EventBusPort,
    @Inject(WAITLIST_REPOSITORY)
    private readonly waitlistRepository: WaitlistRepositoryPort,
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepositoryPort,
    @Inject(SERVICE_REPOSITORY)
    private readonly serviceRepository: ServiceRepositoryPort,
    @InjectQueue(EMAIL_NOTIFICATIONS_QUEUE)
    private readonly emailQueue: Queue<SendEmailJob>,
    private readonly configService: ConfigService,
  ) {}

  onModuleInit(): void {
    this.eventBus.subscribe<AppointmentCancelledEvent>(
      'AppointmentCancelled',
      (event) => this.handle(event),
    );
  }

  async handle(event: AppointmentCancelledEvent): Promise<void> {
    try {
      await this.notifyNextWaitlistedCustomer(event);
    } catch (error) {
      this.logger.error(
        `Waitlist notification processing failed for appointment ${event.aggregateId}`,
        error instanceof Error ? error.stack : String(error),
      );
    }
  }

  private async notifyNextWaitlistedCustomer(
    event: AppointmentCancelledEvent,
  ): Promise<void> {
    const availableDate = this.onlyDate(event.startAt);

    for (let attempt = 0; attempt < WAITLIST_CLAIM_ATTEMPTS; attempt += 1) {
      const matchingEntry = await this.waitlistRepository.findFirstActiveForSlot(
        event.serviceId,
        availableDate,
      );

      if (!matchingEntry) {
        return;
      }

      const claimed = await this.waitlistRepository.markNotified(matchingEntry.id);

      if (!claimed) {
        continue;
      }

      const [waitlistCustomer, service] = await Promise.all([
        this.userRepository.findById(claimed.customerId),
        this.serviceRepository.findById(claimed.serviceId),
      ]);

      if (!waitlistCustomer || !service) {
        this.logger.warn(
          `Skipping waitlist entry ${claimed.id}: missing ${
            waitlistCustomer ? 'service' : 'customer'
          }`,
        );
        continue;
      }

      try {
        await this.enqueueAvailabilityEmail(claimed, waitlistCustomer, service, event);
      } catch (error) {
        this.logger.error(
          `Failed to queue waitlist notification for entry ${claimed.id}`,
          error instanceof Error ? error.stack : String(error),
        );
        await this.waitlistRepository.revertToActiveIfNotified(claimed.id);
      }

      return;
    }

    this.logger.warn(
      `Exhausted ${WAITLIST_CLAIM_ATTEMPTS} waitlist claim attempts for service ${event.serviceId}`,
    );
  }

  private async enqueueAvailabilityEmail(
    entry: WaitlistEntryEntity,
    waitlistCustomer: UserEntity,
    service: ServiceEntity,
    event: AppointmentCancelledEvent,
  ): Promise<void> {
    const frontendUrl = (
      this.configService.get<string>('FRONTEND_URL') ?? 'http://localhost:3001'
    ).replace(/\/$/, '');
    const timeZone =
      this.configService.get<string>('BUSINESS_TIMEZONE') ?? 'Asia/Jerusalem';
    const serviceName = service.toJSON().name;

    await this.emailQueue.add(
      EmailJobName.SEND_EMAIL,
      {
        to: waitlistCustomer.email,
        subject: `A time opened for ${serviceName}`,
        html: waitlistSlotAvailableTemplate({
          customerName: `${waitlistCustomer.firstName} ${waitlistCustomer.lastName}`.trim(),
          serviceName,
          startAt: event.startAt,
          endAt: event.endAt,
          timeZone,
          bookingUrl: `${frontendUrl}/book/service/${entry.serviceId}`,
        }),
      },
      { attempts: 3, backoff: { type: 'exponential', delay: 1_000 } },
    );
  }

  private onlyDate(date: Date): Date {
    return new Date(
      Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()),
    );
  }
}
