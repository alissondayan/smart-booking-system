import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { EVENT_BUS, EventBusPort } from '../../../shared/application/event-bus.port';
import { CALENDAR_SYNC_QUEUE } from '../../../shared/infrastructure/queue/queue.constants';
import { AppointmentBookedEvent } from '../../scheduling/domain/events/appointment-booked.event';
import { AppointmentRescheduledEvent } from '../../scheduling/domain/events/appointment-rescheduled.event';
import {
  CalendarSyncJob,
  CalendarSyncJobName,
} from '../infrastructure/queue/calendar-sync.job.types';

@Injectable()
export class SyncAppointmentToCalendarHandler implements OnModuleInit {
  constructor(
    @Inject(EVENT_BUS)
    private readonly eventBus: EventBusPort,
    @InjectQueue(CALENDAR_SYNC_QUEUE)
    private readonly calendarQueue: Queue<CalendarSyncJob>,
  ) {}

  onModuleInit(): void {
    this.eventBus.subscribe<AppointmentBookedEvent>('AppointmentBooked', (event) =>
      this.enqueueSync(event.aggregateId),
    );
    this.eventBus.subscribe<AppointmentRescheduledEvent>(
      'AppointmentRescheduled',
      (event) => this.enqueueUpdate(event.aggregateId),
    );
  }

  private async enqueueSync(appointmentId: string): Promise<void> {
    await this.calendarQueue.add(
      CalendarSyncJobName.SYNC_APPOINTMENT,
      { appointmentId },
      { attempts: 3, backoff: { type: 'exponential', delay: 1_000 } },
    );
  }

  private async enqueueUpdate(appointmentId: string): Promise<void> {
    await this.calendarQueue.add(
      CalendarSyncJobName.UPDATE_APPOINTMENT,
      { appointmentId },
      { attempts: 3, backoff: { type: 'exponential', delay: 1_000 } },
    );
  }
}
