import { DomainEvent } from '../../../../shared/domain/events/domain-event.base';

export class AppointmentBookedEvent extends DomainEvent {
  readonly eventName = 'AppointmentBooked';

  constructor(
    appointmentId: string,
    readonly serviceId: string,
    readonly customerId: string,
    readonly startAt: Date,
    readonly endAt: Date,
  ) {
    super(appointmentId);
  }
}
