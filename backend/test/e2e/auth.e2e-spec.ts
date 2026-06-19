import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import * as request from 'supertest';
import { randomUUID } from 'crypto';
import { AppModule } from '../../src/app.module';
import { UserRole } from '../../src/shared/domain/enums/user-role.enum';
import { RedisService } from '../../src/shared/infrastructure/cache/redis.service';
import { PrismaService } from '../../src/shared/infrastructure/database/prisma.service';
import { UserEntity } from '../../src/modules/identity/domain/entities/user.entity';
import {
  CreateRefreshTokenData,
  CreateUserData,
  RefreshTokenRecord,
  USER_REPOSITORY,
  UserRepositoryPort,
} from '../../src/modules/identity/domain/ports/user.repository.port';
import { createValidationPipe } from '../../src/shared/presentation/pipes/validation.pipe';
import {
  createMockPrismaService,
  createMockRedisService,
} from '../helpers/test-db.helper';

class InMemoryUserRepository implements UserRepositoryPort {
  private readonly users = new Map<string, UserEntity>();
  private readonly refreshTokens = new Map<string, RefreshTokenRecord>();

  findById(id: string): Promise<UserEntity | null> {
    return Promise.resolve(this.users.get(id) ?? null);
  }

  findByEmail(email: string): Promise<UserEntity | null> {
    const user = [...this.users.values()].find(
      (candidate) => candidate.email === email.toLowerCase(),
    );

    return Promise.resolve(user ?? null);
  }

  findByGoogleId(googleId: string): Promise<UserEntity | null> {
    const user = [...this.users.values()].find(
      (candidate) => candidate.googleId === googleId,
    );

    return Promise.resolve(user ?? null);
  }

  create(data: CreateUserData): Promise<UserEntity> {
    const now = new Date();
    const user = new UserEntity({
      id: randomUUID(),
      email: data.email.toLowerCase(),
      passwordHash: data.passwordHash,
      googleId: data.googleId,
      role: data.role,
      firstName: data.firstName,
      lastName: data.lastName,
      phone: data.phone,
      createdAt: now,
      updatedAt: now,
    });

    this.users.set(user.id, user);

    return Promise.resolve(user);
  }

  createRefreshToken(
    data: CreateRefreshTokenData,
  ): Promise<RefreshTokenRecord> {
    const refreshToken = {
      id: randomUUID(),
      userId: data.userId,
      tokenHash: data.tokenHash,
      expiresAt: data.expiresAt,
      createdAt: new Date(),
    };

    this.refreshTokens.set(refreshToken.id, refreshToken);

    return Promise.resolve(refreshToken);
  }

  findRefreshTokenByHash(
    tokenHash: string,
  ): Promise<RefreshTokenRecord | null> {
    const refreshToken = [...this.refreshTokens.values()].find(
      (candidate) => candidate.tokenHash === tokenHash,
    );

    return Promise.resolve(refreshToken ?? null);
  }

  async deleteRefreshToken(id: string): Promise<void> {
    this.refreshTokens.delete(id);
  }

  async deleteExpiredRefreshTokens(userId: string, now: Date): Promise<void> {
    [...this.refreshTokens.values()]
      .filter(
        (refreshToken) =>
          refreshToken.userId === userId && refreshToken.expiresAt < now,
      )
      .forEach((refreshToken) => this.refreshTokens.delete(refreshToken.id));
  }

  async seedOwner(): Promise<UserEntity> {
    return this.create({
      email: 'owner@example.com',
      passwordHash: null,
      role: UserRole.OWNER,
      firstName: 'Owner',
      lastName: 'User',
    });
  }
}

describe('Auth (e2e)', () => {
  let app: INestApplication;
  let userRepository: InMemoryUserRepository;

  beforeEach(async () => {
    process.env.JWT_SECRET = 'test-access-secret';
    userRepository = new InMemoryUserRepository();

    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(USER_REPOSITORY)
      .useValue(userRepository)
      .overrideProvider(PrismaService)
      .useValue(createMockPrismaService())
      .overrideProvider(RedisService)
      .useValue(createMockRedisService())
      .compile();

    app = moduleRef.createNestApplication();
    app.setGlobalPrefix('api/v1');
    app.useGlobalPipes(createValidationPipe());
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('registers a customer and returns tokens', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/v1/auth/register')
      .send({
        email: 'Customer@Example.com',
        password: 'strong-password',
        firstName: 'Dana',
        lastName: 'Cohen',
      })
      .expect(201);

    expect(response.body).toMatchObject({
      accessToken: expect.any(String),
      refreshToken: expect.any(String),
      user: {
        email: 'customer@example.com',
        role: UserRole.CUSTOMER,
        firstName: 'Dana',
        lastName: 'Cohen',
      },
    });
  });

  it('logs in, reads the current user, refreshes, and logs out', async () => {
    await request(app.getHttpServer()).post('/api/v1/auth/register').send({
      email: 'customer@example.com',
      password: 'strong-password',
      firstName: 'Dana',
      lastName: 'Cohen',
    });

    const loginResponse = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({
        email: 'customer@example.com',
        password: 'strong-password',
      })
      .expect(201);

    const { accessToken, refreshToken } = loginResponse.body as {
      accessToken: string;
      refreshToken: string;
    };

    await request(app.getHttpServer())
      .get('/api/v1/auth/me')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200)
      .expect((response) => {
        expect(response.body.email).toBe('customer@example.com');
      });

    const refreshResponse = await request(app.getHttpServer())
      .post('/api/v1/auth/refresh')
      .send({ refreshToken })
      .expect(201);

    await request(app.getHttpServer())
      .post('/api/v1/auth/logout')
      .set('Authorization', `Bearer ${refreshResponse.body.accessToken}`)
      .send({ refreshToken: refreshResponse.body.refreshToken })
      .expect(201)
      .expect({ success: true });
  });
});
