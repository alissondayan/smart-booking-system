import { ConfigService } from '@nestjs/config';
import { EventBusPort } from '../../../shared/application/event-bus.port';
import { WaitlistStatus } from '../../../shared/domain/enums/waitlist-status.enum';
import { UserRole } from '../../../shared/domain/enums/user-role.enum';
import { ServiceEntity } from '../../catalog/domain/entities/service.entity';
import { UserEntity } from '../../identity/domain/entities/user.entity';
import { AppointmentCancelledEvent } from '../../scheduling/domain/events/appointment-cancelled.event';
import { WaitlistEntryEntity, WaitlistEntryProps } from '../domain/entities/waitlist-entry.entity';
import { ProcessWaitlistOnCancelHandler } from './process-waitlist-on-cancel.handler';

const SERVICE_ID = 'service-id';
const WAITLIST_CUSTOMER_ID = 'waitlist-customer-id';
const CANCELLING_CUSTOMER_ID = 'cancelling-customer-id';
const FIRST_ENTRY_ID = 'waitlist-entry-1';
const SECOND_ENTRY_ID = 'waitlist-entry-2';
const FRONTEND_URL = 'https://book.example.com';
const START_AT = new Date('2026-06-20T09:00:00.000Z');
const END_AT = new Date('2026-06-20T09:30:00.000Z');

function buildEntry(overrides: Partial<WaitlistEntryProps> = {}): WaitlistEntryEntity {
  return new WaitlistEntryEntity({
    id: FIRST_ENTRY_ID,
    serviceId: SERVICE_ID,
    customerId: WAITLIST_CUSTOMER_ID,
    preferredDate: new Date('2026-06-20T00:00:00.000Z'),
    status: WaitlistStatus.ACTIVE,
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    updatedAt: new Date('2026-01-01T00:00:00.000Z'),
    ...overrides,
  });
}

function buildUser(id: string, email: string, firstName: string): UserEntity {
  return new UserEntity({
    id,
    email,
    role: UserRole.CUSTOMER,
    firstName,
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

function createHandler(overrides?: {
  findFirstActiveForSlot?: jest.Mock;
  markNotified?: jest.Mock;
  revertToActiveIfNotified?: jest.Mock;
  findUserById?: jest.Mock;
  findServiceById?: jest.Mock;
  emailQueueAdd?: jest.Mock;
}) {
  const waitlistRepository = {
    findFirstActiveForSlot:
      overrides?.findFirstActiveForSlot ??
      jest.fn().mockResolvedValue(buildEntry()),
    markNotified:
      overrides?.markNotified ??
      jest.fn().mockImplementation((id: string) =>
        Promise.resolve(buildEntry({ id, status: WaitlistStatus.NOTIFIED })),
      ),
    revertToActiveIfNotified:
      overrides?.revertToActiveIfNotified ?? jest.fn().mockResolvedValue(null),
  };
  const userRepository = {
    findById:
      overrides?.findUserById ??
      jest.fn().mockImplementation((id: string) => {
        if (id === WAITLIST_CUSTOMER_ID) {
          return Promise.resolve(
            buildUser(WAITLIST_CUSTOMER_ID, 'waitlist@example.com', 'Waitlist'),
          );
        }

        return Promise.resolve(
          buildUser(CANCELLING_CUSTOMER_ID, 'cancelling@example.com', 'Cancelling'),
        );
      }),
  };
  const serviceRepository = {
    findById: overrides?.findServiceById ?? jest.fn().mockResolvedValue(buildService()),
  };
  const emailQueue = {
    add: overrides?.emailQueueAdd ?? jest.fn().mockResolvedValue(undefined),
  };
  const configService = {
    get: jest.fn((key: string) => {
      if (key === 'FRONTEND_URL') {
        return FRONTEND_URL;
      }

      if (key === 'BUSINESS_TIMEZONE') {
        return 'Asia/Jerusalem';
      }

      return undefined;
    }),
  };
  const eventBus = { subscribe: jest.fn() } as unknown as EventBusPort;
  const handler = new ProcessWaitlistOnCancelHandler(
    eventBus,
    waitlistRepository as never,
    userRepository as never,
    serviceRepository as never,
    emailQueue as never,
    configService as unknown as ConfigService,
  );

  return {
    handler,
    waitlistRepository,
    userRepository,
    emailQueue,
  };
}

function cancelledEvent(): AppointmentCancelledEvent {
  return new AppointmentCancelledEvent(
    'appointment-id',
    SERVICE_ID,
    CANCELLING_CUSTOMER_ID,
    START_AT,
    END_AT,
  );
}

describe('ProcessWaitlistOnCancelHandler', () => {
  it('claims a matching ACTIVE entry and queues a waitlist availability email', async () => {
    const { handler, waitlistRepository, emailQueue } = createHandler();

    await handler.handle(cancelledEvent());

    expect(waitlistRepository.markNotified).toHaveBeenCalledWith(FIRST_ENTRY_ID);
    expect(emailQueue.add).toHaveBeenCalledWith(
      'send-email',
      expect.objectContaining({
        to: 'waitlist@example.com',
        subject: 'A time opened for Haircut',
      }),
      expect.objectContaining({ attempts: 3 }),
    );

    const html = (emailQueue.add as jest.Mock).mock.calls[0][1].html as string;
    expect(html).toContain('Haircut');
    expect(html).toContain(`${FRONTEND_URL}/book/service/${SERVICE_ID}`);
    expect(html).toMatch(/not reserved/i);
    expect(html).not.toContain(START_AT.toISOString());
    expect(html).not.toContain('.000Z');
  });

  it('emails the waitlist customer rather than the cancelling customer', async () => {
    const { handler, userRepository, emailQueue } = createHandler();

    await handler.handle(cancelledEvent());

    expect(userRepository.findById).toHaveBeenCalledWith(WAITLIST_CUSTOMER_ID);
    expect(userRepository.findById).not.toHaveBeenCalledWith(CANCELLING_CUSTOMER_ID);
    expect(emailQueue.add).toHaveBeenCalledWith(
      'send-email',
      expect.objectContaining({ to: 'waitlist@example.com' }),
      expect.any(Object),
    );
    expect(emailQueue.add).not.toHaveBeenCalledWith(
      'send-email',
      expect.objectContaining({ to: 'cancelling@example.com' }),
      expect.any(Object),
    );
  });

  it('does nothing when no matching waitlist entry exists', async () => {
    const { handler, waitlistRepository, emailQueue } = createHandler({
      findFirstActiveForSlot: jest.fn().mockResolvedValue(null),
    });

    await handler.handle(cancelledEvent());

    expect(waitlistRepository.markNotified).not.toHaveBeenCalled();
    expect(emailQueue.add).not.toHaveBeenCalled();
  });

  it('notifies the FIFO entry returned by findFirstActiveForSlot and only that entry', async () => {
    const first = buildEntry({
      id: FIRST_ENTRY_ID,
      customerId: WAITLIST_CUSTOMER_ID,
      createdAt: new Date('2026-01-01T00:00:00.000Z'),
    });
    const { handler, waitlistRepository, emailQueue } = createHandler({
      findFirstActiveForSlot: jest.fn().mockResolvedValue(first),
      markNotified: jest.fn().mockResolvedValue(
        buildEntry({ id: FIRST_ENTRY_ID, status: WaitlistStatus.NOTIFIED }),
      ),
    });

    await handler.handle(cancelledEvent());

    expect(waitlistRepository.findFirstActiveForSlot).toHaveBeenCalledTimes(1);
    expect(waitlistRepository.markNotified).toHaveBeenCalledTimes(1);
    expect(waitlistRepository.markNotified).toHaveBeenCalledWith(FIRST_ENTRY_ID);
    expect(waitlistRepository.markNotified).not.toHaveBeenCalledWith(SECOND_ENTRY_ID);
    expect(emailQueue.add).toHaveBeenCalledTimes(1);
  });

  it('retries selection when the conditional claim is lost and emails the next eligible entry', async () => {
    const first = buildEntry({ id: FIRST_ENTRY_ID, customerId: 'already-claimed-customer' });
    const second = buildEntry({
      id: SECOND_ENTRY_ID,
      customerId: WAITLIST_CUSTOMER_ID,
    });
    const findFirstActiveForSlot = jest
      .fn()
      .mockResolvedValueOnce(first)
      .mockResolvedValueOnce(second);
    const markNotified = jest
      .fn()
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(
        buildEntry({
          id: SECOND_ENTRY_ID,
          customerId: WAITLIST_CUSTOMER_ID,
          status: WaitlistStatus.NOTIFIED,
        }),
      );
    const { handler, emailQueue } = createHandler({
      findFirstActiveForSlot,
      markNotified,
    });

    await handler.handle(cancelledEvent());

    expect(findFirstActiveForSlot).toHaveBeenCalledTimes(2);
    expect(markNotified).toHaveBeenNthCalledWith(1, FIRST_ENTRY_ID);
    expect(markNotified).toHaveBeenNthCalledWith(2, SECOND_ENTRY_ID);
    expect(emailQueue.add).toHaveBeenCalledTimes(1);
    expect(emailQueue.add).toHaveBeenCalledWith(
      'send-email',
      expect.objectContaining({ to: 'waitlist@example.com' }),
      expect.any(Object),
    );
  });

  it('reverts the claim to ACTIVE and does not throw when queue.add fails', async () => {
    const revertToActiveIfNotified = jest.fn().mockResolvedValue(
      buildEntry({ status: WaitlistStatus.ACTIVE }),
    );
    const { handler, waitlistRepository } = createHandler({
      revertToActiveIfNotified,
      emailQueueAdd: jest.fn().mockRejectedValue(new Error('redis unavailable')),
    });

    await expect(handler.handle(cancelledEvent())).resolves.toBeUndefined();

    expect(waitlistRepository.markNotified).toHaveBeenCalledWith(FIRST_ENTRY_ID);
    expect(revertToActiveIfNotified).toHaveBeenCalledWith(FIRST_ENTRY_ID);
  });

  it('does not email a cancelled or otherwise non-ACTIVE entry that cannot be claimed', async () => {
    const findFirstActiveForSlot = jest
      .fn()
      .mockResolvedValueOnce(
        buildEntry({ id: FIRST_ENTRY_ID, status: WaitlistStatus.CANCELLED }),
      )
      .mockResolvedValueOnce(null);
    const markNotified = jest.fn().mockResolvedValue(null);
    const { handler, emailQueue } = createHandler({
      findFirstActiveForSlot,
      markNotified,
    });

    await handler.handle(cancelledEvent());

    expect(markNotified).toHaveBeenCalledWith(FIRST_ENTRY_ID);
    expect(emailQueue.add).not.toHaveBeenCalled();
  });
});
