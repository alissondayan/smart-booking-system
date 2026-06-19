import { DomainEvent } from '../../../../shared/domain/events/domain-event.base';

export class AppointmentCancelledEvent extends DomainEvent {
  readonly eventName = 'AppointmentCancelled';

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
