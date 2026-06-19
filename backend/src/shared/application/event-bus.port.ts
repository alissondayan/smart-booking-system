import { DomainEvent } from '../domain/events/domain-event.base';

export const EVENT_BUS = Symbol('EVENT_BUS');

export interface EventBusPort {
  publish(event: DomainEvent): Promise<void>;
  publishAll(events: DomainEvent[]): Promise<void>;
}
