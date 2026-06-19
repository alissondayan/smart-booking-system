import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Inject, Injectable } from '@nestjs/common';
import { Job } from 'bullmq';
import { CALENDAR_SYNC_QUEUE } from '../../../../shared/infrastructure/queue/queue.constants';
import {
  BUSINESS_REPOSITORY,
  BusinessRepositoryPort,
} from '../../../business/domain/ports/business.repository.port';
import {
  SERVICE_REPOSITORY,
  ServiceRepositoryPort,
} from '../../../catalog/domain/ports/service.repository.port';
import {
  APPOINTMENT_REPOSITORY,
  AppointmentRepositoryPort,
} from '../../../scheduling/domain/ports/appointment.repository.port';
import { CALENDAR_INTEGRATION_REPOSITORY, CalendarIntegrationRepositoryPort } from '../../domain/ports/calendar-integration.repository.port';
import { CALENDAR_PORT, CalendarAppointment, CalendarPort } from '../../domain/ports/calendar.port';
import { CalendarSyncJob, CalendarSyncJobName } from './calendar-sync.job.types';

@Injectable()
@Processor(CALENDAR_SYNC_QUEUE)
export class CalendarSyncProcessor extends WorkerHost {
  constructor(
    @Inject(CALENDAR_PORT)
    private readonly calendarPort: CalendarPort,
    @Inject(CALENDAR_INTEGRATION_REPOSITORY)
    private readonly integrationRepository: CalendarIntegrationRepositoryPort,
    @Inject(APPOINTMENT_REPOSITORY)
    private readonly appointmentRepository: AppointmentRepositoryPort,
    @Inject(SERVICE_REPOSITORY)
    private readonly serviceRepository: ServiceRepositoryPort,
    @Inject(BUSINESS_REPOSITORY)
    private readonly businessRepository: BusinessRepositoryPort,
  ) {
    super();
  }

  async process(job: Job<CalendarSyncJob>): Promise<void> {
    const integration = await this.integrationRepository.findGoogle();

    if (!integration) {
      return;
    }

    if (job.name === CalendarSyncJobName.REMOVE_APPOINTMENT) {
      await this.remove(job.data.appointmentId);
      return;
    }

    const appointment = await this.buildCalendarAppointment(job.data.appointmentId);

    if (!appointment) {
      return;
    }

    const storedAppointment = await this.appointmentRepository.findById(
      job.data.appointmentId,
    );
    const googleEventId = storedAppointment?.toJSON().googleEventId;

    if (job.name === CalendarSyncJobName.UPDATE_APPOINTMENT && googleEventId) {
      await this.calendarPort.updateEvent(googleEventId, appointment);
      return;
    }

    const newEventId = await this.calendarPort.createEvent(appointment);
    await this.appointmentRepository.updateGoogleEventId(
      job.data.appointmentId,
      newEventId,
    );
  }

  private async remove(appointmentId: string): Promise<void> {
    const appointment = await this.appointmentRepository.findById(appointmentId);
    const googleEventId = appointment?.toJSON().googleEventId;

    if (!googleEventId) {
      return;
    }

    await this.calendarPort.deleteEvent(googleEventId);
    await this.appointmentRepository.updateGoogleEventId(appointmentId, null);
  }

  private async buildCalendarAppointment(
    appointmentId: string,
  ): Promise<CalendarAppointment | null> {
    const appointment = await this.appointmentRepository.findById(appointmentId);

    if (!appointment) {
      return null;
    }

    const appointmentData = appointment.toJSON();
    const [service, business] = await Promise.all([
      this.serviceRepository.findById(appointmentData.serviceId),
      this.businessRepository.get(),
    ]);

    if (!service) {
      return null;
    }

    return {
      id: appointmentData.id,
      serviceName: service.toJSON().name,
      businessName: business?.toJSON().name ?? 'Smart Booking',
      startAt: appointmentData.startAt,
      endAt: appointmentData.endAt,
    };
  }
}
