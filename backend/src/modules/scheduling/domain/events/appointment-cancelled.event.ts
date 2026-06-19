import { DomainEvent } from '../../../../shared/domain/events/domain-event.base';

export class AppointmentCancelledEvent extends DomainEvent {
  readonly eventName = 'AppointmentCancelled';
}
