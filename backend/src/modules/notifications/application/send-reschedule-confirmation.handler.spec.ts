import { ConfigService } from '@nestjs/config';
import { EventBusPort } from '../../../shared/application/event-bus.port';
import { UserRole } from '../../../shared/domain/enums/user-role.enum';
import { ServiceEntity } from '../../catalog/domain/entities/service.entity';
import { UserEntity } from '../../identity/domain/entities/user.entity';
import { AppointmentRescheduledEvent } from '../../scheduling/domain/events/appointment-rescheduled.event';
import { formatAppointmentTime } from '../infrastructure/templates/waitlist-slot-available.template';
import { SendRescheduleConfirmationHandler } from './send-reschedule-confirmation.handler';

const APPOINTMENT_ID = 'appointment-id';
const SERVICE_ID = 'service-id';
const CUSTOMER_ID = 'customer-id';
const TIME_ZONE = 'Asia/Jerusalem';
const PREVIOUS_START_AT = new Date('2026-06-20T09:00:00.000Z');
const PREVIOUS_END_AT = new Date('2026-06-20T09:30:00.000Z');
const NEW_START_AT = new Date('2026-06-20T10:00:00.000Z');
const NEW_END_AT = new Date('2026-06-20T10:30:00.000Z');

function buildCustomer(): UserEntity {
  return new UserEntity({
    id: CUSTOMER_ID,
    email: 'customer@example.com',
    role: UserRole.CUSTOMER,
    firstName: 'Dana',
    lastName: 'Cohen',
    createdAt: new Date(),
    updatedAt: new Date(),
  });
}

function buildService(): ServiceEntity {
  return new ServiceEntity({
    id: SERVICE_ID,
    name: 'Haircut',
    durationMinutes: 30,
    price: 100,
    isActive: true,
    sortOrder: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  });
}

function createHarness(options?: {
  customer?: UserEntity | null;
  service?: ServiceEntity | null;
  emailQueueAdd?: jest.Mock;
}) {
  const eventBus = { subscribe: jest.fn() } as unknown as EventBusPort;
  const emailQueueAdd =
    options?.emailQueueAdd ?? jest.fn().mockResolvedValue(undefined);
  const findCustomerById = jest.fn().mockResolvedValue(
    options && 'customer' in options ? options.customer : buildCustomer(),
  );
  const findServiceById = jest.fn().mockResolvedValue(
    options && 'service' in options ? options.service : buildService(),
  );
  const configService = {
    get: jest.fn((key: string) =>
      key === 'BUSINESS_TIMEZONE' ? TIME_ZONE : undefined,
    ),
  };
  const handler = new SendRescheduleConfirmationHandler(
    eventBus,
    { findById: findCustomerById } as never,
    { findById: findServiceById } as never,
    { add: emailQueueAdd } as never,
    configService as unknown as ConfigService,
  );

  return {
    handler,
    emailQueueAdd,
    findCustomerById,
    findServiceById,
  };
}

function rescheduledEvent(
  overrides?: Partial<{
    previousStartAt: Date;
    previousEndAt: Date;
    startAt: Date;
    endAt: Date;
  }>,
): AppointmentRescheduledEvent {
  return new AppointmentRescheduledEvent(
    APPOINTMENT_ID,
    SERVICE_ID,
    CUSTOMER_ID,
    overrides?.previousStartAt ?? PREVIOUS_START_AT,
    overrides?.previousEndAt ?? PREVIOUS_END_AT,
    overrides?.startAt ?? NEW_START_AT,
    overrides?.endAt ?? NEW_END_AT,
  );
}

describe('SendRescheduleConfirmationHandler', () => {
  it('queues a reschedule confirmation email when an appointment is rescheduled', async () => {
    const harness = createHarness();

    await harness.handler.handle(rescheduledEvent());

    expect(harness.emailQueueAdd).toHaveBeenCalledTimes(1);
    expect(harness.emailQueueAdd).toHaveBeenCalledWith(
      'send-email',
      expect.objectContaining({
        to: 'customer@example.com',
        subject: 'Appointment rescheduled',
      }),
      expect.objectContaining({
        attempts: 3,
        backoff: { type: 'exponential', delay: 1_000 },
      }),
    );

    const html = harness.emailQueueAdd.mock.calls[0][1].html as string;
    expect(html).toContain('Haircut');
    expect(html).toContain('Dana Cohen');
    expect(html).toContain(TIME_ZONE);
    expect(html).toContain(
      formatAppointmentTime(PREVIOUS_START_AT, TIME_ZONE),
    );
    expect(html).toContain(formatAppointmentTime(PREVIOUS_END_AT, TIME_ZONE));
    expect(html).toContain(formatAppointmentTime(NEW_START_AT, TIME_ZONE));
    expect(html).toContain(formatAppointmentTime(NEW_END_AT, TIME_ZONE));
  });

  it('does not enqueue an email when the customer is missing', async () => {
    const harness = createHarness({ customer: null });

    await harness.handler.handle(rescheduledEvent());

    expect(harness.emailQueueAdd).not.toHaveBeenCalled();
  });

  it('does not enqueue an email when the service is missing', async () => {
    const harness = createHarness({ service: null });

    await harness.handler.handle(rescheduledEvent());

    expect(harness.emailQueueAdd).not.toHaveBeenCalled();
  });

  it('does not enqueue an email when the appointment time is unchanged', async () => {
    const harness = createHarness();

    await harness.handler.handle(
      rescheduledEvent({
        startAt: PREVIOUS_START_AT,
        endAt: PREVIOUS_END_AT,
      }),
    );

    expect(harness.findCustomerById).not.toHaveBeenCalled();
    expect(harness.findServiceById).not.toHaveBeenCalled();
    expect(harness.emailQueueAdd).not.toHaveBeenCalled();
  });

  it('does not throw when queue.add fails', async () => {
    const harness = createHarness({
      emailQueueAdd: jest.fn().mockRejectedValue(new Error('redis unavailable')),
    });

    await expect(
      harness.handler.handle(rescheduledEvent()),
    ).resolves.toBeUndefined();
    expect(harness.emailQueueAdd).toHaveBeenCalledTimes(1);
  });
});
