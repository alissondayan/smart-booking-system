import { ConflictException, ForbiddenException } from '@nestjs/common';
import { AppointmentStatus } from '../../../shared/domain/enums/appointment-status.enum';
import { ServiceEntity } from '../../catalog/domain/entities/service.entity';
import {
  AppointmentEntity,
  AppointmentProps,
} from '../domain/entities/appointment.entity';
import { RescheduleAppointmentUseCase } from './reschedule-appointment.use-case';

const APPOINTMENT_ID = 'appointment-id';
const SERVICE_ID = 'service-id';
const CUSTOMER_ID = 'customer-id';
const DURATION_MINUTES = 30;
const NEW_START_AT = new Date('2099-06-20T10:00:00.000Z');
const NEW_END_AT = new Date('2099-06-20T10:30:00.000Z');
const FIXED_DATE = new Date('2099-01-01T00:00:00.000Z');

function buildAppointment(
  overrides: Partial<AppointmentProps> = {},
): AppointmentEntity {
  return new AppointmentEntity({
    id: APPOINTMENT_ID,
    serviceId: SERVICE_ID,
    customerId: CUSTOMER_ID,
    startAt: new Date('2099-06-20T09:00:00.000Z'),
    endAt: new Date('2099-06-20T09:30:00.000Z'),
    status: AppointmentStatus.CONFIRMED,
    version: 1,
    createdAt: FIXED_DATE,
    updatedAt: FIXED_DATE,
    ...overrides,
  });
}

function createHarness(appointment: AppointmentEntity) {
  const publish = jest.fn().mockResolvedValue(undefined);
  const release = jest.fn().mockResolvedValue(undefined);
  const acquire = jest.fn().mockResolvedValue(true);
  const rescheduleIfSlotAvailable = jest
    .fn()
    .mockImplementation((id: string, startAt: Date, endAt: Date) =>
      Promise.resolve(buildAppointment({ id, startAt, endAt })),
    );
  const serviceRepository = {
    findActiveById: jest.fn().mockResolvedValue(
      new ServiceEntity({
        id: SERVICE_ID,
        name: 'Haircut',
        durationMinutes: DURATION_MINUTES,
        price: 100,
        isActive: true,
        sortOrder: 0,
        createdAt: FIXED_DATE,
        updatedAt: FIXED_DATE,
      }),
    ),
  };
  const getAvailableSlotsUseCase = {
    execute: jest
      .fn()
      .mockResolvedValue([{ startAt: NEW_START_AT, endAt: NEW_END_AT }]),
  };
  const useCase = new RescheduleAppointmentUseCase(
    serviceRepository as never,
    {
      findById: jest.fn().mockResolvedValue(appointment),
      rescheduleIfSlotAvailable,
    } as never,
    { acquire, release } as never,
    { publish } as never,
    getAvailableSlotsUseCase as never,
  );

  return { useCase, rescheduleIfSlotAvailable, publish };
}

describe('RescheduleAppointmentUseCase', () => {
  it('reschedules a future confirmed appointment owned by the customer', async () => {
    const harness = createHarness(buildAppointment());

    const result = await harness.useCase.execute({
      appointmentId: APPOINTMENT_ID,
      customerId: CUSTOMER_ID,
      newStartAt: NEW_START_AT,
    });

    expect(result.startAt).toEqual(NEW_START_AT);
    expect(result.endAt).toEqual(NEW_END_AT);
    expect(harness.rescheduleIfSlotAvailable).toHaveBeenCalledWith(
      APPOINTMENT_ID,
      NEW_START_AT,
      NEW_END_AT,
    );
    expect(harness.publish).toHaveBeenCalledTimes(1);
  });

  it('rejects a cancelled appointment', async () => {
    const harness = createHarness(
      buildAppointment({ status: AppointmentStatus.CANCELLED }),
    );

    await expect(
      harness.useCase.execute({
        appointmentId: APPOINTMENT_ID,
        customerId: CUSTOMER_ID,
        newStartAt: NEW_START_AT,
      }),
    ).rejects.toBeInstanceOf(ConflictException);
    expect(harness.rescheduleIfSlotAvailable).not.toHaveBeenCalled();
  });

  it('rejects a completed appointment', async () => {
    const harness = createHarness(
      buildAppointment({ status: AppointmentStatus.COMPLETED }),
    );

    await expect(
      harness.useCase.execute({
        appointmentId: APPOINTMENT_ID,
        customerId: CUSTOMER_ID,
        newStartAt: NEW_START_AT,
      }),
    ).rejects.toBeInstanceOf(ConflictException);
    expect(harness.rescheduleIfSlotAvailable).not.toHaveBeenCalled();
  });

  it('rejects a confirmed appointment that has already started', async () => {
    const harness = createHarness(
      buildAppointment({
        startAt: new Date('2020-01-01T09:00:00.000Z'),
        endAt: new Date('2020-01-01T09:30:00.000Z'),
      }),
    );

    await expect(
      harness.useCase.execute({
        appointmentId: APPOINTMENT_ID,
        customerId: CUSTOMER_ID,
        newStartAt: NEW_START_AT,
      }),
    ).rejects.toBeInstanceOf(ConflictException);
    expect(harness.rescheduleIfSlotAvailable).not.toHaveBeenCalled();
  });

  it('rejects an appointment owned by another customer', async () => {
    const harness = createHarness(
      buildAppointment({ customerId: 'another-customer-id' }),
    );

    await expect(
      harness.useCase.execute({
        appointmentId: APPOINTMENT_ID,
        customerId: CUSTOMER_ID,
        newStartAt: NEW_START_AT,
      }),
    ).rejects.toBeInstanceOf(ForbiddenException);
    expect(harness.rescheduleIfSlotAvailable).not.toHaveBeenCalled();
  });
});
