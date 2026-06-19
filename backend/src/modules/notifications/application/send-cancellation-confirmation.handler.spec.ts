import { EventBusPort } from '../../../shared/application/event-bus.port';
import { UserRole } from '../../../shared/domain/enums/user-role.enum';
import { ServiceEntity } from '../../catalog/domain/entities/service.entity';
import { UserEntity } from '../../identity/domain/entities/user.entity';
import { AppointmentCancelledEvent } from '../../scheduling/domain/events/appointment-cancelled.event';
import { SendCancellationConfirmationHandler } from './send-cancellation-confirmation.handler';

describe('SendCancellationConfirmationHandler', () => {
  it('queues a cancellation confirmation email when an appointment is cancelled', async () => {
    const eventBus = { subscribe: jest.fn() } as unknown as EventBusPort;
    const emailQueue = { add: jest.fn().mockResolvedValue(undefined) };
    const handler = new SendCancellationConfirmationHandler(
      eventBus,
      {
        findById: jest.fn().mockResolvedValue(
          new UserEntity({
            id: 'customer-id',
            email: 'customer@example.com',
            role: UserRole.CUSTOMER,
            firstName: 'Dana',
            lastName: 'Cohen',
            createdAt: new Date(),
            updatedAt: new Date(),
          }),
        ),
      } as never,
      {
        findById: jest.fn().mockResolvedValue(
          new ServiceEntity({
            id: 'service-id',
            name: 'Haircut',
            durationMinutes: 30,
            price: 100,
            isActive: true,
            sortOrder: 0,
            createdAt: new Date(),
            updatedAt: new Date(),
          }),
        ),
      } as never,
      emailQueue as never,
    );

    await handler.handle(
      new AppointmentCancelledEvent(
        'appointment-id',
        'service-id',
        'customer-id',
        new Date('2026-06-20T09:00:00.000Z'),
        new Date('2026-06-20T09:30:00.000Z'),
      ),
    );

    expect(emailQueue.add).toHaveBeenCalledWith(
      'send-email',
      expect.objectContaining({
        to: 'customer@example.com',
        subject: 'Appointment cancelled',
      }),
      expect.objectContaining({ attempts: 3 }),
    );
  });
});
