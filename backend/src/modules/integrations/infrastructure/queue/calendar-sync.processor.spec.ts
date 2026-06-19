import { Job } from 'bullmq';
import { BusinessEntity } from '../../../business/domain/entities/business.entity';
import { ServiceEntity } from '../../../catalog/domain/entities/service.entity';
import { AppointmentEntity } from '../../../scheduling/domain/entities/appointment.entity';
import { AppointmentStatus } from '../../../../shared/domain/enums/appointment-status.enum';
import { CalendarSyncJob, CalendarSyncJobName } from './calendar-sync.job.types';
import { CalendarSyncProcessor } from './calendar-sync.processor';

describe('CalendarSyncProcessor', () => {
  it('creates a Google event and stores googleEventId', async () => {
    const updateGoogleEventId = jest.fn().mockResolvedValue(undefined);
    const processor = new CalendarSyncProcessor(
      { createEvent: jest.fn().mockResolvedValue('google-event-id') } as never,
      { findGoogle: jest.fn().mockResolvedValue({ id: 'integration-id' }) } as never,
      {
        findById: jest.fn().mockResolvedValue(appointment()),
        updateGoogleEventId,
      } as never,
      { findById: jest.fn().mockResolvedValue(service()) } as never,
      { get: jest.fn().mockResolvedValue(business()) } as never,
    );

    await processor.process({
      name: CalendarSyncJobName.SYNC_APPOINTMENT,
      data: { appointmentId: 'appointment-id' },
    } as Job<CalendarSyncJob>);

    expect(updateGoogleEventId).toHaveBeenCalledWith(
      'appointment-id',
      'google-event-id',
    );
  });

  it('deletes an existing Google event on cancellation', async () => {
    const deleteEvent = jest.fn().mockResolvedValue(undefined);
    const updateGoogleEventId = jest.fn().mockResolvedValue(undefined);
    const processor = new CalendarSyncProcessor(
      { deleteEvent } as never,
      { findGoogle: jest.fn().mockResolvedValue({ id: 'integration-id' }) } as never,
      {
        findById: jest.fn().mockResolvedValue(
          appointment({ googleEventId: 'google-event-id' }),
        ),
        updateGoogleEventId,
      } as never,
      { findById: jest.fn() } as never,
      { get: jest.fn() } as never,
    );

    await processor.process({
      name: CalendarSyncJobName.REMOVE_APPOINTMENT,
      data: { appointmentId: 'appointment-id' },
    } as Job<CalendarSyncJob>);

    expect(deleteEvent).toHaveBeenCalledWith('google-event-id');
    expect(updateGoogleEventId).toHaveBeenCalledWith('appointment-id', null);
  });
});

function appointment(overrides: Partial<ReturnType<AppointmentEntity['toJSON']>> = {}) {
  return new AppointmentEntity({
    id: 'appointment-id',
    serviceId: 'service-id',
    customerId: 'customer-id',
    startAt: new Date('2026-06-20T09:00:00.000Z'),
    endAt: new Date('2026-06-20T09:30:00.000Z'),
    status: AppointmentStatus.CONFIRMED,
    version: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  });
}

function service() {
  return new ServiceEntity({
    id: 'service-id',
    name: 'Haircut',
    durationMinutes: 30,
    price: 100,
    isActive: true,
    sortOrder: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  });
}

function business() {
  return new BusinessEntity({
    id: 'business-id',
    name: 'Smart Studio',
    phone: '+972501234567',
    email: 'hello@example.com',
    timezone: 'Asia/Jerusalem',
    createdAt: new Date(),
    updatedAt: new Date(),
  });
}
