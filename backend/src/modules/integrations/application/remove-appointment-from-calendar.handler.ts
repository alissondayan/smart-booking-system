import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { EVENT_BUS, EventBusPort } from '../../../shared/application/event-bus.port';
import { CALENDAR_SYNC_QUEUE } from '../../../shared/infrastructure/queue/queue.constants';
import { AppointmentCancelledEvent } from '../../scheduling/domain/events/appointment-cancelled.event';
import {
  CalendarSyncJob,
  CalendarSyncJobName,
} from '../infrastructure/queue/calendar-sync.job.types';

@Injectable()
export class RemoveAppointmentFromCalendarHandler implements OnModuleInit {
  constructor(
    @Inject(EVENT_BUS)
    private readonly eventBus: EventBusPort,
    @InjectQueue(CALENDAR_SYNC_QUEUE)
    private readonly calendarQueue: Queue<CalendarSyncJob>,
  ) {}

  onModuleInit(): void {
    this.eventBus.subscribe<AppointmentCancelledEvent>(
      'AppointmentCancelled',
      (event) => this.enqueueRemove(event.aggregateId),
    );
  }

  private async enqueueRemove(appointmentId: string): Promise<void> {
    await this.calendarQueue.add(
      CalendarSyncJobName.REMOVE_APPOINTMENT,
      { appointmentId },
      { attempts: 3, backoff: { type: 'exponential', delay: 1_000 } },
    );
  }
}
