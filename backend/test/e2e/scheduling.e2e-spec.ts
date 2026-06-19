import { INestApplication } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test } from '@nestjs/testing';
import { randomUUID } from 'crypto';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';
import { BusinessEntity } from '../../src/modules/business/domain/entities/business.entity';
import {
  BUSINESS_REPOSITORY,
  BusinessRepositoryPort,
  UpsertBusinessData,
} from '../../src/modules/business/domain/ports/business.repository.port';
import { ServiceEntity } from '../../src/modules/catalog/domain/entities/service.entity';
import { UserEntity } from '../../src/modules/identity/domain/entities/user.entity';
import {
  USER_REPOSITORY,
  UserRepositoryPort,
} from '../../src/modules/identity/domain/ports/user.repository.port';
import {
  CreateServiceData,
  SERVICE_REPOSITORY,
  ServiceRepositoryPort,
  UpdateServiceData,
} from '../../src/modules/catalog/domain/ports/service.repository.port';
import { AppointmentEntity } from '../../src/modules/scheduling/domain/entities/appointment.entity';
import { AvailabilityRuleEntity } from '../../src/modules/scheduling/domain/entities/availability-rule.entity';
import { BlockedTimeEntity } from '../../src/modules/scheduling/domain/entities/blocked-time.entity';
import { DateAvailabilityEntity } from '../../src/modules/scheduling/domain/entities/date-availability.entity';
import { HolidayEntity } from '../../src/modules/scheduling/domain/entities/holiday.entity';
import {
  APPOINTMENT_REPOSITORY,
  AppointmentListFilters,
  AppointmentRepositoryPort,
  CreateAppointmentData,
} from '../../src/modules/scheduling/domain/ports/appointment.repository.port';
import {
  AVAILABILITY_REPOSITORY,
  AvailabilityRepositoryPort,
  CreateBlockedTimeData,
  CreateHolidayData,
  SetAvailabilityRuleData,
  SetDateAvailabilityData,
} from '../../src/modules/scheduling/domain/ports/availability.repository.port';
import { SLOT_HOLD, SlotHoldPort } from '../../src/modules/scheduling/domain/ports/slot-hold.port';
import { WaitlistEntryEntity } from '../../src/modules/waitlist/domain/entities/waitlist-entry.entity';
import {
  JoinWaitlistData,
  ListWaitlistFilters,
  WAITLIST_REPOSITORY,
  WaitlistRepositoryPort,
} from '../../src/modules/waitlist/domain/ports/waitlist.repository.port';
import { AppointmentStatus } from '../../src/shared/domain/enums/appointment-status.enum';
import { UserRole } from '../../src/shared/domain/enums/user-role.enum';
import { RedisService } from '../../src/shared/infrastructure/cache/redis.service';
import { PrismaService } from '../../src/shared/infrastructure/database/prisma.service';
import { createValidationPipe } from '../../src/shared/presentation/pipes/validation.pipe';
import {
  createMockPrismaService,
  createMockRedisService,
} from '../helpers/test-db.helper';

class SchedulingBusinessRepository implements BusinessRepositoryPort {
  private business = new BusinessEntity({
    id: randomUUID(),
    name: 'Smart Studio',
    phone: '+972501234567',
    email: 'hello@example.com',
    timezone: 'UTC',
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  get(): Promise<BusinessEntity | null> {
    return Promise.resolve(this.business);
  }

  upsert(data: UpsertBusinessData): Promise<BusinessEntity> {
    this.business = new BusinessEntity({
      ...this.business.toJSON(),
      ...data,
      timezone: data.timezone ?? this.business.toJSON().timezone,
      updatedAt: new Date(),
    });

    return Promise.resolve(this.business);
  }

  updateLogo(logoUrl: string): Promise<BusinessEntity> {
    this.business = new BusinessEntity({
      ...this.business.toJSON(),
      logoUrl,
      updatedAt: new Date(),
    });

    return Promise.resolve(this.business);
  }
}

class SchedulingServiceRepository implements ServiceRepositoryPort {
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

class SchedulingAvailabilityRepository implements AvailabilityRepositoryPort {
  private rules: AvailabilityRuleEntity[] = [];
  private dateOverrides = new Map<string, DateAvailabilityEntity>();
  private blockedTimes = new Map<string, BlockedTimeEntity>();
  private holidays = new Map<string, HolidayEntity>();

  listRules(): Promise<AvailabilityRuleEntity[]> {
    return Promise.resolve(this.rules);
  }

  replaceRules(rules: SetAvailabilityRuleData[]): Promise<AvailabilityRuleEntity[]> {
    const now = new Date();
    this.rules = rules.map(
      (rule) =>
        new AvailabilityRuleEntity({
          id: randomUUID(),
          dayOfWeek: rule.dayOfWeek,
          startTime: rule.startTime,
          endTime: rule.endTime,
          isActive: rule.isActive ?? true,
          createdAt: now,
          updatedAt: now,
        }),
    );

    return Promise.resolve(this.rules);
  }

  findRuleByDayOfWeek(dayOfWeek: number): Promise<AvailabilityRuleEntity | null> {
    return Promise.resolve(
      this.rules.find((rule) => rule.toJSON().dayOfWeek === dayOfWeek) ?? null,
    );
  }

  listDateAvailabilities(): Promise<DateAvailabilityEntity[]> {
    return Promise.resolve([...this.dateOverrides.values()]);
  }

  findDateAvailability(date: Date): Promise<DateAvailabilityEntity | null> {
    return Promise.resolve(this.dateOverrides.get(this.key(date)) ?? null);
  }

  setDateAvailability(data: SetDateAvailabilityData): Promise<DateAvailabilityEntity> {
    const now = new Date();
    const override = new DateAvailabilityEntity({
      id: randomUUID(),
      date: data.date,
      startTime: data.startTime,
      endTime: data.endTime,
      isClosed: data.isClosed ?? false,
      createdAt: now,
      updatedAt: now,
    });
    this.dateOverrides.set(this.key(data.date), override);

    return Promise.resolve(override);
  }

  async deleteDateAvailability(date: Date): Promise<void> {
    this.dateOverrides.delete(this.key(date));
  }

  listBlockedTimes(): Promise<BlockedTimeEntity[]> {
    return Promise.resolve([...this.blockedTimes.values()]);
  }

  listBlockedTimesOverlapping(from: Date, to: Date): Promise<BlockedTimeEntity[]> {
    return Promise.resolve(
      [...this.blockedTimes.values()].filter((blockedTime) => {
        const range = blockedTime.toJSON();

        return range.startAt < to && range.endAt > from;
      }),
    );
  }

  createBlockedTime(data: CreateBlockedTimeData): Promise<BlockedTimeEntity> {
    const blockedTime = new BlockedTimeEntity({
      id: randomUUID(),
      startAt: data.startAt,
      endAt: data.endAt,
      reason: data.reason,
      createdAt: new Date(),
    });
    this.blockedTimes.set(blockedTime.toJSON().id, blockedTime);

    return Promise.resolve(blockedTime);
  }

  async deleteBlockedTime(id: string): Promise<void> {
    this.blockedTimes.delete(id);
  }

  listHolidays(): Promise<HolidayEntity[]> {
    return Promise.resolve([...this.holidays.values()]);
  }

  findHoliday(date: Date): Promise<HolidayEntity | null> {
    return Promise.resolve(this.holidays.get(this.key(date)) ?? null);
  }

  createHoliday(data: CreateHolidayData): Promise<HolidayEntity> {
    const holiday = new HolidayEntity({
      id: randomUUID(),
      date: data.date,
      label: data.label,
      createdAt: new Date(),
    });
    this.holidays.set(this.key(data.date), holiday);

    return Promise.resolve(holiday);
  }

  async deleteHoliday(id: string): Promise<void> {
    [...this.holidays.entries()]
      .filter(([, holiday]) => holiday.toJSON().id === id)
      .forEach(([key]) => this.holidays.delete(key));
  }

  private key(date: Date): string {
    return date.toISOString().slice(0, 10);
  }
}

class SchedulingAppointmentRepository implements AppointmentRepositoryPort {
  private readonly appointments = new Map<string, AppointmentEntity>();

  findById(id: string): Promise<AppointmentEntity | null> {
    return Promise.resolve(this.appointments.get(id) ?? null);
  }

  list(filters: AppointmentListFilters): Promise<AppointmentEntity[]> {
    return Promise.resolve(
      [...this.appointments.values()]
        .filter((appointment) => {
          const data = appointment.toJSON();

          return (
            (!filters.customerId || data.customerId === filters.customerId) &&
            (!filters.status || data.status === filters.status) &&
            (!filters.from || data.startAt >= filters.from) &&
            (!filters.to || data.startAt <= filters.to)
          );
        })
        .sort((left, right) => left.startAt.getTime() - right.startAt.getTime()),
    );
  }

  listConfirmedOverlapping(startAt: Date, endAt: Date): Promise<AppointmentEntity[]> {
    return this.list({ status: AppointmentStatus.CONFIRMED }).then((appointments) =>
      appointments.filter((appointment) => {
        const data = appointment.toJSON();

        return data.startAt < endAt && data.endAt > startAt;
      }),
    );
  }

  async createIfSlotAvailable(data: CreateAppointmentData): Promise<AppointmentEntity | null> {
    const overlaps = await this.listConfirmedOverlapping(data.startAt, data.endAt);

    if (overlaps.length) {
      return null;
    }

    const appointment = new AppointmentEntity({
      id: randomUUID(),
      serviceId: data.serviceId,
      customerId: data.customerId,
      startAt: data.startAt,
      endAt: data.endAt,
      status: AppointmentStatus.CONFIRMED,
      version: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    this.appointments.set(appointment.id, appointment);

    return appointment;
  }

  async cancel(id: string): Promise<AppointmentEntity | null> {
    const appointment = this.appointments.get(id);

    if (!appointment) {
      return null;
    }

    const cancelled = new AppointmentEntity({
      ...appointment.toJSON(),
      status: AppointmentStatus.CANCELLED,
      version: appointment.toJSON().version + 1,
      updatedAt: new Date(),
    });
    this.appointments.set(id, cancelled);

    return cancelled;
  }

  async rescheduleIfSlotAvailable(
    id: string,
    startAt: Date,
    endAt: Date,
  ): Promise<AppointmentEntity | null> {
    const appointment = this.appointments.get(id);

    if (!appointment) {
      return null;
    }

    const overlaps = (await this.listConfirmedOverlapping(startAt, endAt)).filter(
      (candidate) => candidate.id !== id,
    );

    if (overlaps.length) {
      return null;
    }

    const rescheduled = new AppointmentEntity({
      ...appointment.toJSON(),
      startAt,
      endAt,
      status: AppointmentStatus.CONFIRMED,
      version: appointment.toJSON().version + 1,
      updatedAt: new Date(),
    });
    this.appointments.set(id, rescheduled);

    return rescheduled;
  }

  async updateNotes(id: string, notes: string | null): Promise<AppointmentEntity | null> {
    const appointment = this.appointments.get(id);

    if (!appointment) {
      return null;
    }

    const updated = new AppointmentEntity({
      ...appointment.toJSON(),
      notes,
      updatedAt: new Date(),
    });
    this.appointments.set(id, updated);

    return updated;
  }
}

class InMemorySlotHold implements SlotHoldPort {
  private readonly holds = new Set<string>();

  async acquire(serviceId: string, startAt: Date): Promise<boolean> {
    const key = `${serviceId}:${startAt.toISOString()}`;

    if (this.holds.has(key)) {
      return false;
    }

    this.holds.add(key);
    return true;
  }

  async release(serviceId: string, startAt: Date): Promise<void> {
    this.holds.delete(`${serviceId}:${startAt.toISOString()}`);
  }
}

class NoopWaitlistRepository implements WaitlistRepositoryPort {
  create(_data: JoinWaitlistData): Promise<WaitlistEntryEntity> {
    throw new Error('Not implemented in scheduling e2e');
  }

  findActiveDuplicate(
    _data: JoinWaitlistData,
  ): Promise<WaitlistEntryEntity | null> {
    return Promise.resolve(null);
  }

  list(_filters: ListWaitlistFilters): Promise<WaitlistEntryEntity[]> {
    return Promise.resolve([]);
  }

  cancelForCustomer(
    _id: string,
    _customerId: string,
  ): Promise<WaitlistEntryEntity | null> {
    return Promise.resolve(null);
  }

  findFirstActiveForSlot(
    _serviceId: string,
    _availableDate: Date,
  ): Promise<WaitlistEntryEntity | null> {
    return Promise.resolve(null);
  }

  markNotified(_id: string): Promise<WaitlistEntryEntity | null> {
    return Promise.resolve(null);
  }
}

class SchedulingUserRepository implements Pick<UserRepositoryPort, 'findById'> {
  findById(id: string): Promise<UserEntity | null> {
    return Promise.resolve(
      new UserEntity({
        id,
        email: 'customer@example.com',
        role: UserRole.CUSTOMER,
        firstName: 'Dana',
        lastName: 'Cohen',
        createdAt: new Date(),
        updatedAt: new Date(),
      }),
    );
  }
}

describe('Scheduling (e2e)', () => {
  let app: INestApplication;
  let jwtService: JwtService;
  let ownerAccessToken: string;
  let customerAccessToken: string;
  let serviceId: string;

  beforeEach(async () => {
    process.env.JWT_SECRET = 'test-access-secret';
    serviceId = randomUUID();

    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(BUSINESS_REPOSITORY)
      .useValue(new SchedulingBusinessRepository())
      .overrideProvider(SERVICE_REPOSITORY)
      .useValue(
        new SchedulingServiceRepository(
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
      .overrideProvider(AVAILABILITY_REPOSITORY)
      .useValue(new SchedulingAvailabilityRepository())
      .overrideProvider(APPOINTMENT_REPOSITORY)
      .useValue(new SchedulingAppointmentRepository())
      .overrideProvider(SLOT_HOLD)
      .useValue(new InMemorySlotHold())
      .overrideProvider(WAITLIST_REPOSITORY)
      .useValue(new NoopWaitlistRepository())
      .overrideProvider(USER_REPOSITORY)
      .useValue(new SchedulingUserRepository())
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
    ownerAccessToken = await jwtService.signAsync(
      { sub: randomUUID(), email: 'owner@example.com', role: UserRole.OWNER },
      { secret: process.env.JWT_SECRET },
    );
    customerAccessToken = await jwtService.signAsync(
      {
        sub: randomUUID(),
        email: 'customer@example.com',
        role: UserRole.CUSTOMER,
      },
      { secret: process.env.JWT_SECRET },
    );
  });

  afterEach(async () => {
    await app.close();
  });

  it('generates slots, books, rejects double booking, reschedules, and cancels', async () => {
    const date = '2099-06-20';
    const dayOfWeek = new Date(`${date}T00:00:00.000Z`).getUTCDay();

    await request(app.getHttpServer())
      .put('/api/v1/admin/availability/rules')
      .set('Authorization', `Bearer ${ownerAccessToken}`)
      .send({
        rules: [{ dayOfWeek, startTime: '09:00', endTime: '10:00' }],
      })
      .expect(200);

    const slotsResponse = await request(app.getHttpServer())
      .get('/api/v1/availability')
      .query({ serviceId, date })
      .expect(200);

    expect(slotsResponse.body).toHaveLength(2);
    const firstSlotStart = slotsResponse.body[0].startAt as string;
    const secondSlotStart = slotsResponse.body[1].startAt as string;

    const appointmentResponse = await request(app.getHttpServer())
      .post('/api/v1/appointments')
      .set('Authorization', `Bearer ${customerAccessToken}`)
      .send({ serviceId, startAt: firstSlotStart })
      .expect(201);
    const appointmentId = appointmentResponse.body.id as string;

    await request(app.getHttpServer())
      .post('/api/v1/appointments')
      .set('Authorization', `Bearer ${customerAccessToken}`)
      .send({ serviceId, startAt: firstSlotStart })
      .expect(409);

    await request(app.getHttpServer())
      .get('/api/v1/me/appointments')
      .set('Authorization', `Bearer ${customerAccessToken}`)
      .expect(200)
      .expect((response) => {
        expect(response.body).toHaveLength(1);
      });

    await request(app.getHttpServer())
      .patch(`/api/v1/me/appointments/${appointmentId}/reschedule`)
      .set('Authorization', `Bearer ${customerAccessToken}`)
      .send({ newStartAt: secondSlotStart })
      .expect(200)
      .expect((response) => {
        expect(response.body.startAt).toBe(secondSlotStart);
      });

    await request(app.getHttpServer())
      .get('/api/v1/admin/appointments')
      .set('Authorization', `Bearer ${ownerAccessToken}`)
      .expect(200)
      .expect((response) => {
        expect(response.body).toHaveLength(1);
      });

    await request(app.getHttpServer())
      .patch(`/api/v1/me/appointments/${appointmentId}/cancel`)
      .set('Authorization', `Bearer ${customerAccessToken}`)
      .expect(200)
      .expect((response) => {
        expect(response.body.status).toBe(AppointmentStatus.CANCELLED);
      });
  });

  it('applies date overrides, blocked times, and holidays to slot generation', async () => {
    const date = '2099-06-21';
    const dayOfWeek = new Date(`${date}T00:00:00.000Z`).getUTCDay();

    await request(app.getHttpServer())
      .put('/api/v1/admin/availability/rules')
      .set('Authorization', `Bearer ${ownerAccessToken}`)
      .send({
        rules: [{ dayOfWeek, startTime: '09:00', endTime: '12:00' }],
      })
      .expect(200);

    await request(app.getHttpServer())
      .put(`/api/v1/admin/availability/dates/${date}`)
      .set('Authorization', `Bearer ${ownerAccessToken}`)
      .send({ startTime: '10:00', endTime: '11:00' })
      .expect(200);

    await request(app.getHttpServer())
      .post('/api/v1/admin/blocked-times')
      .set('Authorization', `Bearer ${ownerAccessToken}`)
      .send({
        startAt: `${date}T10:00:00.000Z`,
        endAt: `${date}T10:30:00.000Z`,
      })
      .expect(201);

    await request(app.getHttpServer())
      .get('/api/v1/availability')
      .query({ serviceId, date })
      .expect(200)
      .expect((response) => {
        expect(response.body).toHaveLength(1);
        expect(response.body[0].startAt).toBe(`${date}T10:30:00.000Z`);
      });

    await request(app.getHttpServer())
      .post('/api/v1/admin/holidays')
      .set('Authorization', `Bearer ${ownerAccessToken}`)
      .send({ date, label: 'Closed' })
      .expect(201);

    await request(app.getHttpServer())
      .get('/api/v1/availability')
      .query({ serviceId, date })
      .expect(200)
      .expect([]);
  });
});
