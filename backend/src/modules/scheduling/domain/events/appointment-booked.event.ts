import { DomainEvent } from '../../../../shared/domain/events/domain-event.base';

export class AppointmentBookedEvent extends DomainEvent {
  readonly eventName = 'AppointmentBooked';
}
