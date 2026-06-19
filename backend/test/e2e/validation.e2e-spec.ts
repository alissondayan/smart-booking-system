import { INestApplication } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test } from '@nestjs/testing';
import { randomUUID } from 'crypto';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';
import { UserRole } from '../../src/shared/domain/enums/user-role.enum';
import { RedisService } from '../../src/shared/infrastructure/cache/redis.service';
import { PrismaService } from '../../src/shared/infrastructure/database/prisma.service';
import { HttpExceptionFilter } from '../../src/shared/presentation/filters/http-exception.filter';
import { createValidationPipe } from '../../src/shared/presentation/pipes/validation.pipe';
import {
  createMockPrismaService,
  createMockRedisService,
} from '../helpers/test-db.helper';

describe('DTO validation (e2e)', () => {
  let app: INestApplication;
  let ownerAccessToken: string;
  let customerAccessToken: string;

  beforeAll(async () => {
    process.env.JWT_SECRET = 'test-access-secret';
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PrismaService)
      .useValue(createMockPrismaService())
      .overrideProvider(RedisService)
      .useValue(createMockRedisService())
      .compile();

    app = moduleRef.createNestApplication();
    app.setGlobalPrefix('api/v1');
    app.useGlobalPipes(createValidationPipe());
    app.useGlobalFilters(new HttpExceptionFilter());
    await app.init();

    const jwtService = moduleRef.get(JwtService);
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

  afterAll(async () => {
    await app.close();
  });

  it('rejects invalid public auth DTOs', async () => {
    await request(app.getHttpServer())
      .post('/api/v1/auth/register')
      .send({
        email: 'not-an-email',
        password: 'short',
        firstName: '',
        lastName: '',
        unexpected: true,
      })
      .expect(400)
      .expect((response) => {
        expect(response.body.error.code).toBe('VALIDATION_ERROR');
      });
  });

  it('rejects invalid owner service DTOs', async () => {
    await request(app.getHttpServer())
      .post('/api/v1/admin/services')
      .set('Authorization', `Bearer ${ownerAccessToken}`)
      .send({
        name: '',
        durationMinutes: 0,
        price: -1,
      })
      .expect(400)
      .expect((response) => {
        expect(response.body.error.code).toBe('VALIDATION_ERROR');
      });
  });

  it('rejects invalid customer booking DTOs', async () => {
    await request(app.getHttpServer())
      .post('/api/v1/appointments')
      .set('Authorization', `Bearer ${customerAccessToken}`)
      .send({
        serviceId: 'not-a-uuid',
        startAt: 'not-a-date',
      })
      .expect(400)
      .expect((response) => {
        expect(response.body.error.code).toBe('VALIDATION_ERROR');
      });
  });
});
