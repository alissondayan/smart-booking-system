import { DomainEvent } from '../../../../shared/domain/events/domain-event.base';

export class AppointmentRescheduledEvent extends DomainEvent {
  readonly eventName = 'AppointmentRescheduled';

  constructor(
    appointmentId: string,
    readonly serviceId: string,
    readonly customerId: string,
    readonly previousStartAt: Date,
    readonly previousEndAt: Date,
    readonly startAt: Date,
    readonly endAt: Date,
  ) {
    super(appointmentId);
  }
}
