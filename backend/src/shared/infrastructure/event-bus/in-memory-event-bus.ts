import { Injectable } from '@nestjs/common';
import {
  DomainEventHandler,
  EventBusPort,
} from '../../application/event-bus.port';
import { DomainEvent } from '../../domain/events/domain-event.base';

@Injectable()
export class InMemoryEventBus implements EventBusPort {
  private readonly handlers = new Map<string, DomainEventHandler[]>();

  async publish(event: DomainEvent): Promise<void> {
    const handlers = this.handlers.get(event.eventName) ?? [];

    await Promise.all(handlers.map((handler) => handler(event)));
  }

  async publishAll(events: DomainEvent[]): Promise<void> {
    for (const event of events) {
      await this.publish(event);
    }
  }

  subscribe<TEvent extends DomainEvent>(
    eventName: string,
    handler: DomainEventHandler<TEvent>,
  ): void {
    const handlers = this.handlers.get(eventName) ?? [];
    handlers.push(handler as DomainEventHandler);
    this.handlers.set(eventName, handlers);
  }
}
