import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { EVENT_BUS, EventBusPort } from '../../../shared/application/event-bus.port';
import { AppointmentCancelledEvent } from '../../scheduling/domain/events/appointment-cancelled.event';
import {
  WAITLIST_REPOSITORY,
  WaitlistRepositoryPort,
} from '../domain/ports/waitlist.repository.port';

@Injectable()
export class ProcessWaitlistOnCancelHandler implements OnModuleInit {
  constructor(
    @Inject(EVENT_BUS)
    private readonly eventBus: EventBusPort,
    @Inject(WAITLIST_REPOSITORY)
    private readonly waitlistRepository: WaitlistRepositoryPort,
  ) {}

  onModuleInit(): void {
    this.eventBus.subscribe<AppointmentCancelledEvent>(
      'AppointmentCancelled',
      (event) => this.handle(event),
    );
  }

  async handle(event: AppointmentCancelledEvent): Promise<void> {
    const matchingEntry = await this.waitlistRepository.findFirstActiveForSlot(
      event.serviceId,
      this.onlyDate(event.startAt),
    );

    if (!matchingEntry) {
      return;
    }

    await this.waitlistRepository.markNotified(matchingEntry.id);
  }

  private onlyDate(date: Date): Date {
    return new Date(
      Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()),
    );
  }
}
