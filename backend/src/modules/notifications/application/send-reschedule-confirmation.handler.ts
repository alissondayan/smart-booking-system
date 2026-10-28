import { Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { ConfigService } from '@nestjs/config';
import { Queue } from 'bullmq';
import { EVENT_BUS, EventBusPort } from '../../../shared/application/event-bus.port';
import { EMAIL_NOTIFICATIONS_QUEUE } from '../../../shared/infrastructure/queue/queue.constants';
import {
  SERVICE_REPOSITORY,
  ServiceRepositoryPort,
} from '../../catalog/domain/ports/service.repository.port';
import {
  USER_REPOSITORY,
  UserRepositoryPort,
} from '../../identity/domain/ports/user.repository.port';
import { AppointmentRescheduledEvent } from '../../scheduling/domain/events/appointment-rescheduled.event';
import { EmailJobName, SendEmailJob } from '../infrastructure/queue/email.job.types';
import { rescheduleConfirmationTemplate } from '../infrastructure/templates/reschedule-confirmation.template';

@Injectable()
export class SendRescheduleConfirmationHandler implements OnModuleInit {
  private readonly logger = new Logger(SendRescheduleConfirmationHandler.name);

  constructor(
    @Inject(EVENT_BUS)
    private readonly eventBus: EventBusPort,
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepositoryPort,
    @Inject(SERVICE_REPOSITORY)
    private readonly serviceRepository: ServiceRepositoryPort,
    @InjectQueue(EMAIL_NOTIFICATIONS_QUEUE)
    private readonly emailQueue: Queue<SendEmailJob>,
    private readonly configService: ConfigService,
  ) {}

  onModuleInit(): void {
    this.eventBus.subscribe<AppointmentRescheduledEvent>(
      'AppointmentRescheduled',
      (event) => this.handle(event),
    );
  }

  async handle(event: AppointmentRescheduledEvent): Promise<void> {
    if (this.hasUnchangedTimes(event)) {
      return;
    }

    const [customer, service] = await Promise.all([
      this.userRepository.findById(event.customerId),
      this.serviceRepository.findById(event.serviceId),
    ]);

    if (!customer || !service) {
      return;
    }

    const serviceData = service.toJSON();
    const timeZone =
      this.configService.get<string>('BUSINESS_TIMEZONE') ?? 'Asia/Jerusalem';

    try {
      await this.emailQueue.add(
        EmailJobName.SEND_EMAIL,
        {
          to: customer.email,
          subject: 'Appointment rescheduled',
          html: rescheduleConfirmationTemplate({
            customerName: `${customer.firstName} ${customer.lastName}`.trim(),
            serviceName: serviceData.name,
            previousStartAt: event.previousStartAt,
            previousEndAt: event.previousEndAt,
            startAt: event.startAt,
            endAt: event.endAt,
            timeZone,
          }),
        },
        { attempts: 3, backoff: { type: 'exponential', delay: 1_000 } },
      );
    } catch (error) {
      this.logger.error(
        `Failed to queue reschedule confirmation for appointment ${event.aggregateId}`,
        error instanceof Error ? error.stack : String(error),
      );
    }
  }

  private hasUnchangedTimes(event: AppointmentRescheduledEvent): boolean {
    return (
      event.previousStartAt.getTime() === event.startAt.getTime() &&
      event.previousEndAt.getTime() === event.endAt.getTime()
    );
  }
}
