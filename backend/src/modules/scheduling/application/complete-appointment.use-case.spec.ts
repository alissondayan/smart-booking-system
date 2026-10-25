import { ConflictException, NotFoundException } from '@nestjs/common';
import { AppointmentStatus } from '../../../shared/domain/enums/appointment-status.enum';
import {
  AppointmentEntity,
  AppointmentProps,
} from '../domain/entities/appointment.entity';
import { CompleteAppointmentUseCase } from './complete-appointment.use-case';

const APPOINTMENT_ID = 'appointment-id';
const SERVICE_ID = 'service-id';
const CUSTOMER_ID = 'customer-id';
const FIXED_DATE = new Date('2020-01-01T00:00:00.000Z');
const PAST_START_AT = new Date('2020-06-20T09:00:00.000Z');
const PAST_END_AT = new Date('2020-06-20T09:30:00.000Z');
const FUTURE_START_AT = new Date('2099-06-20T09:00:00.000Z');
const FUTURE_END_AT = new Date('2099-06-20T09:30:00.000Z');

function buildAppointment(
  overrides: Partial<AppointmentProps> = {},
): AppointmentEntity {
  return new AppointmentEntity({
    id: APPOINTMENT_ID,
    serviceId: SERVICE_ID,
    customerId: CUSTOMER_ID,
    startAt: PAST_START_AT,
    endAt: PAST_END_AT,
    status: AppointmentStatus.CONFIRMED,
    version: 1,
    createdAt: FIXED_DATE,
    updatedAt: FIXED_DATE,
    ...overrides,
  });
}

function createHarness(appointment: AppointmentEntity | null) {
  const complete = jest
    .fn()
    .mockImplementation((id: string) =>
      Promise.resolve(
        buildAppointment({ id, status: AppointmentStatus.COMPLETED, version: 2 }),
      ),
    );
  const useCase = new CompleteAppointmentUseCase({
    findById: jest.fn().mockResolvedValue(appointment),
    complete,
  } as never);

  return { useCase, complete };
}

describe('CompleteAppointmentUseCase', () => {
  it('completes a confirmed appointment that has already ended', async () => {
    const harness = createHarness(buildAppointment());

    const result = await harness.useCase.execute({
      appointmentId: APPOINTMENT_ID,
    });

    expect(result.status).toBe(AppointmentStatus.COMPLETED);
    expect(harness.complete).toHaveBeenCalledWith(APPOINTMENT_ID);
  });

  it('rejects an appointment that has not ended yet', async () => {
    const harness = createHarness(
      buildAppointment({ startAt: FUTURE_START_AT, endAt: FUTURE_END_AT }),
    );

    await expect(
      harness.useCase.execute({ appointmentId: APPOINTMENT_ID }),
    ).rejects.toBeInstanceOf(ConflictException);
    expect(harness.complete).not.toHaveBeenCalled();
  });

  it('rejects a cancelled appointment', async () => {
    const harness = createHarness(
      buildAppointment({ status: AppointmentStatus.CANCELLED }),
    );

    await expect(
      harness.useCase.execute({ appointmentId: APPOINTMENT_ID }),
    ).rejects.toBeInstanceOf(ConflictException);
    expect(harness.complete).not.toHaveBeenCalled();
  });

  it('rejects an already completed appointment', async () => {
    const harness = createHarness(
      buildAppointment({ status: AppointmentStatus.COMPLETED }),
    );

    await expect(
      harness.useCase.execute({ appointmentId: APPOINTMENT_ID }),
    ).rejects.toBeInstanceOf(ConflictException);
    expect(harness.complete).not.toHaveBeenCalled();
  });

  it('rejects an appointment that does not exist', async () => {
    const harness = createHarness(null);

    await expect(
      harness.useCase.execute({ appointmentId: APPOINTMENT_ID }),
    ).rejects.toBeInstanceOf(NotFoundException);
    expect(harness.complete).not.toHaveBeenCalled();
  });
});
