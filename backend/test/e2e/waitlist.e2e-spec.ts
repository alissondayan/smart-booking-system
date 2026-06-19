import { INestApplication } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test } from '@nestjs/testing';
import { randomUUID } from 'crypto';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';
import { EVENT_BUS, EventBusPort } from '../../src/shared/application/event-bus.port';
import { UserRole } from '../../src/shared/domain/enums/user-role.enum';
import { WaitlistStatus } from '../../src/shared/domain/enums/waitlist-status.enum';
import { RedisService } from '../../src/shared/infrastructure/cache/redis.service';
import { PrismaService } from '../../src/shared/infrastructure/database/prisma.service';
import { ServiceEntity } from '../../src/modules/catalog/domain/entities/service.entity';
import {
  CreateServiceData,
  SERVICE_REPOSITORY,
  ServiceRepositoryPort,
  UpdateServiceData,
} from '../../src/modules/catalog/domain/ports/service.repository.port';
import { AppointmentCancelledEvent } from '../../src/modules/scheduling/domain/events/appointment-cancelled.event';
import { WaitlistEntryEntity } from '../../src/modules/waitlist/domain/entities/waitlist-entry.entity';
import {
  JoinWaitlistData,
  ListWaitlistFilters,
  WAITLIST_REPOSITORY,
  WaitlistRepositoryPort,
} from '../../src/modules/waitlist/domain/ports/waitlist.repository.port';
import { createValidationPipe } from '../../src/shared/presentation/pipes/validation.pipe';
import {
  createMockPrismaService,
  createMockRedisService,
} from '../helpers/test-db.helper';

class WaitlistServiceRepository implements ServiceRepositoryPort {
  constructor(private readonly service: ServiceEntity) {}

  listActive(): Promise<ServiceEntity[]> {
    return Promise.resolve([this.service]);
  }

  listAll(): Promise<ServiceEntity[]> {
    return Promise.resolve([this.service]);
  }

  findActiveById(id: string): Promise<ServiceEntity | null> {
    return Promise.resolve(this.service.id === id ? this.service : null);
  }

  findById(id: string): Promise<ServiceEntity | null> {
    return Promise.resolve(this.service.id === id ? this.service : null);
  }

  create(_data: CreateServiceData): Promise<ServiceEntity> {
    return Promise.resolve(this.service);
  }

  update(_id: string, _data: UpdateServiceData): Promise<ServiceEntity | null> {
    return Promise.resolve(this.service);
  }

  deactivate(_id: string): Promise<ServiceEntity | null> {
    return Promise.resolve(this.service);
  }
}

class InMemoryWaitlistRepository implements WaitlistRepositoryPort {
  private readonly entries = new Map<string, WaitlistEntryEntity>();

  create(data: JoinWaitlistData): Promise<WaitlistEntryEntity> {
    const now = new Date();
    const entry = new WaitlistEntryEntity({
      id: randomUUID(),
      serviceId: data.serviceId,
      customerId: data.customerId,
      preferredDate: data.preferredDate,
      status: WaitlistStatus.ACTIVE,
      createdAt: now,
      updatedAt: now,
    });

    this.entries.set(entry.id, entry);

    return Promise.resolve(entry);
  }

  findActiveDuplicate(
    data: JoinWaitlistData,
  ): Promise<WaitlistEntryEntity | null> {
    const preferredDate = data.preferredDate?.toISOString().slice(0, 10) ?? null;
    const duplicate = [...this.entries.values()].find((entry) => {
      const entryData = entry.toJSON();
      const entryDate = entryData.preferredDate?.toISOString().slice(0, 10) ?? null;

      return (
        entryData.serviceId === data.serviceId &&
        entryData.customerId === data.customerId &&
        entryDate === preferredDate &&
        entryData.status === WaitlistStatus.ACTIVE
      );
    });

    return Promise.resolve(duplicate ?? null);
  }

  list(filters: ListWaitlistFilters): Promise<WaitlistEntryEntity[]> {
    return Promise.resolve(
      [...this.entries.values()].filter((entry) => {
        const entryData = entry.toJSON();

        return (
          (!filters.customerId || entryData.customerId === filters.customerId) &&
          (!filters.serviceId || entryData.serviceId === filters.serviceId) &&
          (!filters.status || entryData.status === filters.status)
        );
      }),
    );
  }

  cancelForCustomer(
    id: string,
    customerId: string,
  ): Promise<WaitlistEntryEntity | null> {
    const entry = this.entries.get(id);

    if (!entry || entry.customerId !== customerId) {
      return Promise.resolve(null);
    }

    const cancelled = new WaitlistEntryEntity({
      ...entry.toJSON(),
      status: WaitlistStatus.CANCELLED,
      updatedAt: new Date(),
    });
    this.entries.set(id, cancelled);

    return Promise.resolve(cancelled);
  }

  findFirstActiveForSlot(
    serviceId: string,
    availableDate: Date,
  ): Promise<WaitlistEntryEntity | null> {
    const availableDateKey = availableDate.toISOString().slice(0, 10);
    const entry = [...this.entries.values()].find((candidate) => {
      const data = candidate.toJSON();
      const preferredDate = data.preferredDate?.toISOString().slice(0, 10);

      return (
        data.serviceId === serviceId &&
        data.status === WaitlistStatus.ACTIVE &&
        (!preferredDate || preferredDate === availableDateKey)
      );
    });

    return Promise.resolve(entry ?? null);
  }

  markNotified(id: string): Promise<WaitlistEntryEntity | null> {
    const entry = this.entries.get(id);

    if (!entry) {
      return Promise.resolve(null);
    }

    const notified = new WaitlistEntryEntity({
      ...entry.toJSON(),
      status: WaitlistStatus.NOTIFIED,
      updatedAt: new Date(),
    });
    this.entries.set(id, notified);

    return Promise.resolve(notified);
  }
}

describe('Waitlist (e2e)', () => {
  let app: INestApplication;
  let jwtService: JwtService;
  let eventBus: EventBusPort;
  let ownerAccessToken: string;
  let customerAccessToken: string;
  let serviceId: string;
  let customerId: string;

  beforeEach(async () => {
    process.env.JWT_SECRET = 'test-access-secret';
    serviceId = randomUUID();
    customerId = randomUUID();

    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(SERVICE_REPOSITORY)
      .useValue(
        new WaitlistServiceRepository(
          new ServiceEntity({
            id: serviceId,
            name: 'Haircut',
            durationMinutes: 30,
            price: 100,
            isActive: true,
            sortOrder: 0,
            createdAt: new Date(),
            updatedAt: new Date(),
          }),
        ),
      )
      .overrideProvider(WAITLIST_REPOSITORY)
      .useValue(new InMemoryWaitlistRepository())
      .overrideProvider(PrismaService)
      .useValue(createMockPrismaService())
      .overrideProvider(RedisService)
      .useValue(createMockRedisService())
      .compile();

    app = moduleRef.createNestApplication();
    app.setGlobalPrefix('api/v1');
    app.useGlobalPipes(createValidationPipe());
    await app.init();

    jwtService = moduleRef.get(JwtService);
    eventBus = moduleRef.get<EventBusPort>(EVENT_BUS);
    ownerAccessToken = await jwtService.signAsync(
      { sub: randomUUID(), email: 'owner@example.com', role: UserRole.OWNER },
      { secret: process.env.JWT_SECRET },
    );
    customerAccessToken = await jwtService.signAsync(
      {
        sub: customerId,
        email: 'customer@example.com',
        role: UserRole.CUSTOMER,
      },
      { secret: process.env.JWT_SECRET },
    );
  });

  afterEach(async () => {
    await app.close();
  });

  it('joins, lists, filters, notifies on cancellation event, and cancels own entry', async () => {
    const preferredDate = '2099-06-20';
    const joinResponse = await request(app.getHttpServer())
      .post('/api/v1/waitlist')
      .set('Authorization', `Bearer ${customerAccessToken}`)
      .send({ serviceId, preferredDate })
      .expect(201);
    const waitlistEntryId = joinResponse.body.id as string;

    await request(app.getHttpServer())
      .post('/api/v1/waitlist')
      .set('Authorization', `Bearer ${customerAccessToken}`)
      .send({ serviceId, preferredDate })
      .expect(409);

    await request(app.getHttpServer())
      .get('/api/v1/me/waitlist')
      .set('Authorization', `Bearer ${customerAccessToken}`)
      .expect(200)
      .expect((response) => {
        expect(response.body).toHaveLength(1);
        expect(response.body[0].status).toBe(WaitlistStatus.ACTIVE);
      });

    await request(app.getHttpServer())
      .get('/api/v1/admin/waitlist')
      .set('Authorization', `Bearer ${ownerAccessToken}`)
      .query({ serviceId, status: WaitlistStatus.ACTIVE })
      .expect(200)
      .expect((response) => {
        expect(response.body).toHaveLength(1);
      });

    await eventBus.publish(
      new AppointmentCancelledEvent(
        randomUUID(),
        serviceId,
        randomUUID(),
        new Date(`${preferredDate}T09:00:00.000Z`),
        new Date(`${preferredDate}T09:30:00.000Z`),
      ),
    );

    await request(app.getHttpServer())
      .get('/api/v1/admin/waitlist')
      .set('Authorization', `Bearer ${ownerAccessToken}`)
      .query({ status: WaitlistStatus.NOTIFIED })
      .expect(200)
      .expect((response) => {
        expect(response.body).toHaveLength(1);
        expect(response.body[0].id).toBe(waitlistEntryId);
      });

    await request(app.getHttpServer())
      .delete(`/api/v1/me/waitlist/${waitlistEntryId}`)
      .set('Authorization', `Bearer ${customerAccessToken}`)
      .expect(200)
      .expect((response) => {
        expect(response.body.status).toBe(WaitlistStatus.CANCELLED);
      });
  });
});
