import { INestApplication } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test } from '@nestjs/testing';
import { randomUUID } from 'crypto';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';
import {
  CUSTOMER_REPOSITORY,
  CustomerDetails,
  CustomerRepositoryPort,
  CustomerSummary,
  ListCustomersQuery,
  PaginatedCustomers,
} from '../../src/modules/customers/domain/ports/customer.repository.port';
import { AppointmentStatus } from '../../src/shared/domain/enums/appointment-status.enum';
import { UserRole } from '../../src/shared/domain/enums/user-role.enum';
import { RedisService } from '../../src/shared/infrastructure/cache/redis.service';
import { PrismaService } from '../../src/shared/infrastructure/database/prisma.service';
import { createValidationPipe } from '../../src/shared/presentation/pipes/validation.pipe';
import {
  createMockPrismaService,
  createMockRedisService,
} from '../helpers/test-db.helper';

class InMemoryCustomerRepository implements CustomerRepositoryPort {
  private readonly customers: CustomerDetails[];

  constructor() {
    const firstCustomerId = randomUUID();
    this.customers = [
      {
        id: firstCustomerId,
        email: 'dana@example.com',
        firstName: 'Dana',
        lastName: 'Cohen',
        phone: '+972501111111',
        createdAt: new Date('2026-01-01T00:00:00.000Z'),
        updatedAt: new Date('2026-01-02T00:00:00.000Z'),
        appointmentCount: 1,
        appointments: [
          {
            id: randomUUID(),
            serviceId: randomUUID(),
            serviceName: 'Haircut',
            startAt: new Date('2026-06-20T09:00:00.000Z'),
            endAt: new Date('2026-06-20T09:30:00.000Z'),
            status: AppointmentStatus.CONFIRMED,
            notes: 'Prefers morning appointments',
          },
        ],
      },
      {
        id: randomUUID(),
        email: 'ron@example.com',
        firstName: 'Ron',
        lastName: 'Levi',
        phone: '+972502222222',
        createdAt: new Date('2026-01-03T00:00:00.000Z'),
        updatedAt: new Date('2026-01-04T00:00:00.000Z'),
        appointmentCount: 0,
        appointments: [],
      },
    ];
  }

  list(query: ListCustomersQuery): Promise<PaginatedCustomers> {
    const search = query.search?.toLowerCase();
    const filtered = search
      ? this.customers.filter((customer) =>
          [
            customer.email,
            customer.firstName,
            customer.lastName,
            customer.phone ?? '',
          ].some((value) => value.toLowerCase().includes(search)),
        )
      : this.customers;
    const start = (query.page - 1) * query.limit;
    const items = filtered.slice(start, start + query.limit).map((customer) => {
      const { appointments: _appointments, ...summary } = customer;

      return summary satisfies CustomerSummary;
    });

    return Promise.resolve({
      items,
      total: filtered.length,
      page: query.page,
      limit: query.limit,
    });
  }

  findById(id: string): Promise<CustomerDetails | null> {
    return Promise.resolve(
      this.customers.find((customer) => customer.id === id) ?? null,
    );
  }
}

describe('Customers (e2e)', () => {
  let app: INestApplication;
  let jwtService: JwtService;
  let ownerAccessToken: string;
  let customerAccessToken: string;

  beforeEach(async () => {
    process.env.JWT_SECRET = 'test-access-secret';

    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(CUSTOMER_REPOSITORY)
      .useValue(new InMemoryCustomerRepository())
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

  it('allows only owners to list customers with search and pagination', async () => {
    await request(app.getHttpServer())
      .get('/api/v1/admin/customers')
      .set('Authorization', `Bearer ${customerAccessToken}`)
      .expect(403);

    await request(app.getHttpServer())
      .get('/api/v1/admin/customers')
      .set('Authorization', `Bearer ${ownerAccessToken}`)
      .query({ search: 'dana', page: 1, limit: 10 })
      .expect(200)
      .expect((response) => {
        expect(response.body).toMatchObject({
          total: 1,
          page: 1,
          limit: 10,
        });
        expect(response.body.items).toHaveLength(1);
        expect(response.body.items[0]).toMatchObject({
          email: 'dana@example.com',
          appointmentCount: 1,
        });
        expect(response.body.items[0].appointments).toBeUndefined();
      });
  });

  it('returns customer details with appointment history', async () => {
    const listResponse = await request(app.getHttpServer())
      .get('/api/v1/admin/customers')
      .set('Authorization', `Bearer ${ownerAccessToken}`)
      .expect(200);
    const customerId = listResponse.body.items[0].id as string;

    await request(app.getHttpServer())
      .get(`/api/v1/admin/customers/${customerId}`)
      .set('Authorization', `Bearer ${ownerAccessToken}`)
      .expect(200)
      .expect((response) => {
        expect(response.body.email).toBe('dana@example.com');
        expect(response.body.appointments).toHaveLength(1);
        expect(response.body.appointments[0]).toMatchObject({
          serviceName: 'Haircut',
          status: AppointmentStatus.CONFIRMED,
        });
      });
  });
});
