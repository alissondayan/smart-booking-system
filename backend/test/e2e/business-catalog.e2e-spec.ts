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
import {
  StoredFile,
  STORAGE_PORT,
  StoragePort,
} from '../../src/modules/business/domain/ports/storage.port';
import { ServiceEntity } from '../../src/modules/catalog/domain/entities/service.entity';
import {
  CreateServiceData,
  SERVICE_REPOSITORY,
  ServiceRepositoryPort,
  UpdateServiceData,
} from '../../src/modules/catalog/domain/ports/service.repository.port';
import { UserRole } from '../../src/shared/domain/enums/user-role.enum';
import { RedisService } from '../../src/shared/infrastructure/cache/redis.service';
import { PrismaService } from '../../src/shared/infrastructure/database/prisma.service';
import { createValidationPipe } from '../../src/shared/presentation/pipes/validation.pipe';
import {
  createMockPrismaService,
  createMockRedisService,
} from '../helpers/test-db.helper';

class InMemoryBusinessRepository implements BusinessRepositoryPort {
  private business: BusinessEntity | null = null;

  get(): Promise<BusinessEntity | null> {
    return Promise.resolve(this.business);
  }

  upsert(data: UpsertBusinessData): Promise<BusinessEntity> {
    const now = new Date();
    this.business = new BusinessEntity({
      id: this.business?.id ?? randomUUID(),
      name: data.name,
      logoUrl: this.business?.toJSON().logoUrl,
      description: data.description,
      phone: data.phone,
      email: data.email,
      address: data.address,
      website: data.website,
      socialLinks: data.socialLinks,
      timezone: data.timezone ?? 'Asia/Jerusalem',
      createdAt: this.business?.toJSON().createdAt ?? now,
      updatedAt: now,
    });

    return Promise.resolve(this.business);
  }

  updateLogo(logoUrl: string): Promise<BusinessEntity> {
    if (!this.business) {
      throw new Error('Business profile is not configured');
    }

    const current = this.business.toJSON();
    this.business = new BusinessEntity({
      ...current,
      logoUrl,
      updatedAt: new Date(),
    });

    return Promise.resolve(this.business);
  }
}

class InMemoryStorageAdapter implements StoragePort {
  saveBusinessLogo(file: StoredFile): Promise<string> {
    return Promise.resolve(`/uploads/business/${file.originalName}`);
  }
}

class InMemoryServiceRepository implements ServiceRepositoryPort {
  private readonly services = new Map<string, ServiceEntity>();

  listActive(): Promise<ServiceEntity[]> {
    return Promise.resolve(
      this.sorted([...this.services.values()].filter((service) => service.isActive)),
    );
  }

  listAll(): Promise<ServiceEntity[]> {
    return Promise.resolve(this.sorted([...this.services.values()]));
  }

  findActiveById(id: string): Promise<ServiceEntity | null> {
    const service = this.services.get(id);

    return Promise.resolve(service?.isActive ? service : null);
  }

  findById(id: string): Promise<ServiceEntity | null> {
    return Promise.resolve(this.services.get(id) ?? null);
  }

  create(data: CreateServiceData): Promise<ServiceEntity> {
    const now = new Date();
    const service = new ServiceEntity({
      id: randomUUID(),
      name: data.name,
      description: data.description,
      durationMinutes: data.durationMinutes,
      price: data.price,
      isActive: data.isActive ?? true,
      sortOrder: data.sortOrder ?? 0,
      createdAt: now,
      updatedAt: now,
    });

    this.services.set(service.id, service);

    return Promise.resolve(service);
  }

  update(id: string, data: UpdateServiceData): Promise<ServiceEntity | null> {
    const existingService = this.services.get(id);

    if (!existingService) {
      return Promise.resolve(null);
    }

    const current = existingService.toJSON();
    const updatedService = new ServiceEntity({
      ...current,
      ...data,
      updatedAt: new Date(),
    });
    this.services.set(id, updatedService);

    return Promise.resolve(updatedService);
  }

  deactivate(id: string): Promise<ServiceEntity | null> {
    return this.update(id, { isActive: false });
  }

  private sorted(services: ServiceEntity[]): ServiceEntity[] {
    return services.sort((left, right) => {
      const leftService = left.toJSON();
      const rightService = right.toJSON();

      return (
        leftService.sortOrder - rightService.sortOrder ||
        leftService.name.localeCompare(rightService.name)
      );
    });
  }
}

describe('Business and Catalog (e2e)', () => {
  let app: INestApplication;
  let jwtService: JwtService;
  let ownerAccessToken: string;
  let customerAccessToken: string;

  beforeEach(async () => {
    process.env.JWT_SECRET = 'test-access-secret';

    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(BUSINESS_REPOSITORY)
      .useValue(new InMemoryBusinessRepository())
      .overrideProvider(STORAGE_PORT)
      .useValue(new InMemoryStorageAdapter())
      .overrideProvider(SERVICE_REPOSITORY)
      .useValue(new InMemoryServiceRepository())
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
      {
        sub: randomUUID(),
        email: 'owner@example.com',
        role: UserRole.OWNER,
      },
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

  it('allows owner to update the business profile and public users to read it', async () => {
    await request(app.getHttpServer())
      .put('/api/v1/business')
      .set('Authorization', `Bearer ${customerAccessToken}`)
      .send({
        name: 'Smart Studio',
        phone: '+972501234567',
        email: 'hello@example.com',
      })
      .expect(403);

    const updateResponse = await request(app.getHttpServer())
      .put('/api/v1/business')
      .set('Authorization', `Bearer ${ownerAccessToken}`)
      .send({
        name: 'Smart Studio',
        description: 'Appointment-based studio',
        phone: '+972501234567',
        email: 'hello@example.com',
        timezone: 'Asia/Jerusalem',
      })
      .expect(200);

    expect(updateResponse.body).toMatchObject({
      name: 'Smart Studio',
      phone: '+972501234567',
      email: 'hello@example.com',
      timezone: 'Asia/Jerusalem',
    });

    await request(app.getHttpServer())
      .get('/api/v1/business')
      .expect(200)
      .expect((response) => {
        expect(response.body.name).toBe('Smart Studio');
      });
  });

  it('supports admin service CRUD and public active service reads', async () => {
    const createResponse = await request(app.getHttpServer())
      .post('/api/v1/admin/services')
      .set('Authorization', `Bearer ${ownerAccessToken}`)
      .send({
        name: 'Haircut',
        description: 'Classic haircut',
        durationMinutes: 45,
        price: 120,
        sortOrder: 1,
      })
      .expect(201);
    const serviceId = createResponse.body.id as string;

    await request(app.getHttpServer())
      .get('/api/v1/services')
      .expect(200)
      .expect((response) => {
        expect(response.body).toHaveLength(1);
        expect(response.body[0].name).toBe('Haircut');
      });

    await request(app.getHttpServer())
      .patch(`/api/v1/admin/services/${serviceId}`)
      .set('Authorization', `Bearer ${ownerAccessToken}`)
      .send({ price: 140 })
      .expect(200)
      .expect((response) => {
        expect(response.body.price).toBe(140);
      });

    await request(app.getHttpServer())
      .delete(`/api/v1/admin/services/${serviceId}`)
      .set('Authorization', `Bearer ${ownerAccessToken}`)
      .expect(200)
      .expect((response) => {
        expect(response.body.isActive).toBe(false);
      });

    await request(app.getHttpServer())
      .get('/api/v1/services')
      .expect(200)
      .expect([]);

    await request(app.getHttpServer())
      .get('/api/v1/admin/services')
      .set('Authorization', `Bearer ${ownerAccessToken}`)
      .expect(200)
      .expect((response) => {
        expect(response.body).toHaveLength(1);
        expect(response.body[0].isActive).toBe(false);
      });
  });
});
