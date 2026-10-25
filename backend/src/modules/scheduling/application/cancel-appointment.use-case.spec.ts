import { ConflictException } from '@nestjs/common';
import { AppointmentStatus } from '../../../shared/domain/enums/appointment-status.enum';
import {
  AppointmentEntity,
  AppointmentProps,
} from '../domain/entities/appointment.entity';
import { CancelAppointmentUseCase } from './cancel-appointment.use-case';

const APPOINTMENT_ID = 'appointment-id';
const SERVICE_ID = 'service-id';
const CUSTOMER_ID = 'customer-id';
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
  const cancel = jest
    .fn()
    .mockImplementation((id: string) =>
      Promise.resolve(
        buildAppointment({ id, status: AppointmentStatus.CANCELLED, version: 2 }),
      ),
    );
  const useCase = new CancelAppointmentUseCase(
    {
      findById: jest.fn().mockResolvedValue(appointment),
      cancel,
    } as never,
    { publish } as never,
  );

  return { useCase, cancel, publish };
}

describe('CancelAppointmentUseCase', () => {
  it('cancels a confirmed appointment and publishes the cancellation event', async () => {
    const harness = createHarness(buildAppointment());

    const result = await harness.useCase.execute({
      appointmentId: APPOINTMENT_ID,
    });

    expect(result.status).toBe(AppointmentStatus.CANCELLED);
    expect(harness.cancel).toHaveBeenCalledWith(APPOINTMENT_ID);
    expect(harness.publish).toHaveBeenCalledTimes(1);
  });

  it('rejects a completed appointment', async () => {
    const harness = createHarness(
      buildAppointment({ status: AppointmentStatus.COMPLETED }),
    );

    await expect(
      harness.useCase.execute({ appointmentId: APPOINTMENT_ID }),
    ).rejects.toBeInstanceOf(ConflictException);
    expect(harness.cancel).not.toHaveBeenCalled();
    expect(harness.publish).not.toHaveBeenCalled();
  });

  it('rejects an already cancelled appointment', async () => {
    const harness = createHarness(
      buildAppointment({ status: AppointmentStatus.CANCELLED }),
    );

    await expect(
      harness.useCase.execute({ appointmentId: APPOINTMENT_ID }),
    ).rejects.toBeInstanceOf(ConflictException);
    expect(harness.cancel).not.toHaveBeenCalled();
    expect(harness.publish).not.toHaveBeenCalled();
  });
});
