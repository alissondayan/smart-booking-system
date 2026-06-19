import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
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
import { AppointmentCancelledEvent } from '../../scheduling/domain/events/appointment-cancelled.event';
import { EmailJobName, SendEmailJob } from '../infrastructure/queue/email.job.types';
import { cancellationConfirmationTemplate } from '../infrastructure/templates/cancellation-confirmation.template';

@Injectable()
export class SendCancellationConfirmationHandler implements OnModuleInit {
  constructor(
    @Inject(EVENT_BUS)
    private readonly eventBus: EventBusPort,
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepositoryPort,
    @Inject(SERVICE_REPOSITORY)
    private readonly serviceRepository: ServiceRepositoryPort,
    @InjectQueue(EMAIL_NOTIFICATIONS_QUEUE)
    private readonly emailQueue: Queue<SendEmailJob>,
  ) {}

  onModuleInit(): void {
    this.eventBus.subscribe<AppointmentCancelledEvent>(
      'AppointmentCancelled',
      (event) => this.handle(event),
    );
  }

  async handle(event: AppointmentCancelledEvent): Promise<void> {
    const [customer, service] = await Promise.all([
      this.userRepository.findById(event.customerId),
      this.serviceRepository.findById(event.serviceId),
    ]);

    if (!customer || !service) {
      return;
    }

    const serviceData = service.toJSON();
    await this.emailQueue.add(
      EmailJobName.SEND_EMAIL,
      {
        to: customer.email,
        subject: 'Appointment cancelled',
        html: cancellationConfirmationTemplate({
          customerName: `${customer.firstName} ${customer.lastName}`.trim(),
          serviceName: serviceData.name,
          startAt: event.startAt,
          endAt: event.endAt,
        }),
      },
      { attempts: 3, backoff: { type: 'exponential', delay: 1_000 } },
    );
  }
}
