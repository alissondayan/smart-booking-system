import { INestApplication } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test } from '@nestjs/testing';
import { randomUUID } from 'crypto';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';
import {
  CALENDAR_INTEGRATION_REPOSITORY,
  CalendarIntegrationRecord,
  CalendarIntegrationRepositoryPort,
  SaveGoogleCalendarIntegrationData,
} from '../../src/modules/integrations/domain/ports/calendar-integration.repository.port';
import { GoogleCalendarAdapter } from '../../src/modules/integrations/infrastructure/google/google-calendar.adapter';
import { GoogleOAuthStateService } from '../../src/modules/integrations/infrastructure/google/google-oauth-state.service';
import { UserRole } from '../../src/shared/domain/enums/user-role.enum';
import { RedisService } from '../../src/shared/infrastructure/cache/redis.service';
import { PrismaService } from '../../src/shared/infrastructure/database/prisma.service';
import { createValidationPipe } from '../../src/shared/presentation/pipes/validation.pipe';
import {
  createMockPrismaService,
  createMockRedisService,
} from '../helpers/test-db.helper';

const CALENDAR_PATH = '/api/v1/admin/integrations/calendar';
const CALLBACK_PATH = `${CALENDAR_PATH}/google/callback`;
const INTEGRATIONS_REDIRECT = 'http://localhost:3001/admin/integrations';

class InMemoryCalendarIntegrationRepository
  implements CalendarIntegrationRepositoryPort
{
  private integration: CalendarIntegrationRecord | null = null;

  findGoogle(): Promise<CalendarIntegrationRecord | null> {
    return Promise.resolve(this.integration);
  }

  saveGoogle(
    data: SaveGoogleCalendarIntegrationData,
  ): Promise<CalendarIntegrationRecord> {
    const now = new Date();
    this.integration = {
      id: this.integration?.id ?? randomUUID(),
      provider: 'GOOGLE',
      accessToken: data.accessToken,
      refreshToken: data.refreshToken,
      tokenExpiresAt: data.tokenExpiresAt,
      calendarId: data.calendarId,
      createdAt: this.integration?.createdAt ?? now,
      updatedAt: now,
    };

    return Promise.resolve(this.integration);
  }

  async deleteGoogle(): Promise<void> {
    this.integration = null;
  }

  isConnected(): boolean {
    return this.integration !== null;
  }
}

describe('Calendar integration OAuth (e2e)', () => {
  let app: INestApplication;
  let integrationRepository: InMemoryCalendarIntegrationRepository;
  let stateService: GoogleOAuthStateService;
  let exchangeCode: jest.SpyInstance;
  let ownerAccessToken: string;
  let customerAccessToken: string;

  beforeEach(async () => {
    process.env.JWT_SECRET = 'test-access-secret';
    process.env.FRONTEND_URL = 'http://localhost:3001';
    process.env.GOOGLE_CLIENT_ID = 'test-google-client-id';
    process.env.GOOGLE_CLIENT_SECRET = 'test-google-client-secret';
    integrationRepository = new InMemoryCalendarIntegrationRepository();

    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(CALENDAR_INTEGRATION_REPOSITORY)
      .useValue(integrationRepository)
      .overrideProvider(PrismaService)
      .useValue(createMockPrismaService())
      .overrideProvider(RedisService)
      .useValue(createMockRedisService())
      .compile();

    app = moduleRef.createNestApplication();
    app.setGlobalPrefix('api/v1');
    app.useGlobalPipes(createValidationPipe());
    await app.init();

    stateService = moduleRef.get(GoogleOAuthStateService);
    // Only the network-bound token exchange is stubbed; the authorization URL
    // is still built by the real Google adapter.
    exchangeCode = jest
      .spyOn(moduleRef.get(GoogleCalendarAdapter), 'exchangeCode')
      .mockResolvedValue({
        accessToken: 'google-access-token',
        refreshToken: 'google-refresh-token',
        tokenExpiresAt: new Date('2026-06-20T10:00:00.000Z'),
      });

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

  afterEach(async () => {
    jest.restoreAllMocks();
    await app.close();
  });

  async function startConnection(): Promise<string> {
    const response = await request(app.getHttpServer())
      .post(`${CALENDAR_PATH}/google/connect`)
      .set('Authorization', `Bearer ${ownerAccessToken}`)
      .expect(201);

    const authUrl = new URL((response.body as { authUrl: string }).authUrl);
    const state = authUrl.searchParams.get('state');

    expect(state).toBeTruthy();

    return state as string;
  }

  describe('starting the connection', () => {
    it('rejects anonymous and non-owner callers', async () => {
      await request(app.getHttpServer())
        .post(`${CALENDAR_PATH}/google/connect`)
        .expect(401);

      await request(app.getHttpServer())
        .post(`${CALENDAR_PATH}/google/connect`)
        .set('Authorization', `Bearer ${customerAccessToken}`)
        .expect(403);
    });

    it('returns a Google authorization URL carrying a verifiable state', async () => {
      const response = await request(app.getHttpServer())
        .post(`${CALENDAR_PATH}/google/connect`)
        .set('Authorization', `Bearer ${ownerAccessToken}`)
        .expect(201);

      const authUrl = new URL((response.body as { authUrl: string }).authUrl);
      expect(authUrl.origin).toBe('https://accounts.google.com');
      expect(authUrl.searchParams.get('access_type')).toBe('offline');
      expect(stateService.verify(authUrl.searchParams.get('state') ?? undefined))
        .not.toBeNull();
    });
  });

  describe('the Google callback', () => {
    it('connects without an Authorization header and redirects to the frontend', async () => {
      const state = await startConnection();

      const response = await request(app.getHttpServer())
        .get(CALLBACK_PATH)
        .query({ code: 'google-auth-code', state })
        .expect(302);

      expect(response.headers.location).toBe(
        `${INTEGRATIONS_REDIRECT}?calendar=connected`,
      );
      expect(exchangeCode).toHaveBeenCalledWith('google-auth-code');
      expect(integrationRepository.isConnected()).toBe(true);

      await request(app.getHttpServer())
        .get(CALENDAR_PATH)
        .set('Authorization', `Bearer ${ownerAccessToken}`)
        .expect(200)
        .expect({ connected: true, calendarId: 'primary' });
    });

    it('tolerates the extra query parameters Google appends', async () => {
      const state = await startConnection();

      const response = await request(app.getHttpServer())
        .get(CALLBACK_PATH)
        .query({
          code: 'google-auth-code',
          state,
          scope: 'https://www.googleapis.com/auth/calendar.events',
          authuser: '0',
          prompt: 'consent',
        })
        .expect(302);

      expect(response.headers.location).toBe(
        `${INTEGRATIONS_REDIRECT}?calendar=connected`,
      );
      expect(integrationRepository.isConnected()).toBe(true);
    });

    it('never leaks the authorization code or state into the redirect', async () => {
      const state = await startConnection();

      const response = await request(app.getHttpServer())
        .get(CALLBACK_PATH)
        .query({ code: 'google-auth-code', state })
        .expect(302);

      expect(response.headers.location).not.toContain('google-auth-code');
      expect(response.headers.location).not.toContain(state);
    });

    it('rejects a missing state without persisting credentials', async () => {
      const response = await request(app.getHttpServer())
        .get(CALLBACK_PATH)
        .query({ code: 'google-auth-code' })
        .expect(302);

      expect(response.headers.location).toBe(
        `${INTEGRATIONS_REDIRECT}?calendar=error&reason=invalid_state`,
      );
      expect(exchangeCode).not.toHaveBeenCalled();
      expect(integrationRepository.isConnected()).toBe(false);
    });

    it('rejects a tampered state without persisting credentials', async () => {
      const state = await startConnection();

      const response = await request(app.getHttpServer())
        .get(CALLBACK_PATH)
        .query({ code: 'google-auth-code', state: `${state}tampered` })
        .expect(302);

      expect(response.headers.location).toBe(
        `${INTEGRATIONS_REDIRECT}?calendar=error&reason=invalid_state`,
      );
      expect(exchangeCode).not.toHaveBeenCalled();
      expect(integrationRepository.isConnected()).toBe(false);
    });

    it('rejects an expired state without persisting credentials', async () => {
      const expiredState = stateService.issue(
        randomUUID(),
        Date.now() - 10 * 60 * 1000,
      );

      const response = await request(app.getHttpServer())
        .get(CALLBACK_PATH)
        .query({ code: 'google-auth-code', state: expiredState })
        .expect(302);

      expect(response.headers.location).toBe(
        `${INTEGRATIONS_REDIRECT}?calendar=error&reason=invalid_state`,
      );
      expect(exchangeCode).not.toHaveBeenCalled();
      expect(integrationRepository.isConnected()).toBe(false);
    });

    it('redirects safely when the owner denies consent', async () => {
      const state = await startConnection();

      const response = await request(app.getHttpServer())
        .get(CALLBACK_PATH)
        .query({ error: 'access_denied', state })
        .expect(302);

      expect(response.headers.location).toBe(
        `${INTEGRATIONS_REDIRECT}?calendar=error&reason=access_denied`,
      );
      expect(exchangeCode).not.toHaveBeenCalled();
      expect(integrationRepository.isConnected()).toBe(false);
    });

    it('redirects with a generic failure when the token exchange fails', async () => {
      const state = await startConnection();
      exchangeCode.mockRejectedValue(new Error('invalid_grant'));

      const response = await request(app.getHttpServer())
        .get(CALLBACK_PATH)
        .query({ code: 'google-auth-code', state })
        .expect(302);

      expect(response.headers.location).toBe(
        `${INTEGRATIONS_REDIRECT}?calendar=error&reason=connection_failed`,
      );
      expect(integrationRepository.isConnected()).toBe(false);
    });
  });

  describe('status and disconnect', () => {
    it('stays restricted to the owner', async () => {
      await request(app.getHttpServer()).get(CALENDAR_PATH).expect(401);
      await request(app.getHttpServer())
        .get(CALENDAR_PATH)
        .set('Authorization', `Bearer ${customerAccessToken}`)
        .expect(403);

      await request(app.getHttpServer()).delete(CALENDAR_PATH).expect(401);
      await request(app.getHttpServer())
        .delete(CALENDAR_PATH)
        .set('Authorization', `Bearer ${customerAccessToken}`)
        .expect(403);
    });

    it('lets the owner disconnect a connected calendar', async () => {
      const state = await startConnection();
      await request(app.getHttpServer())
        .get(CALLBACK_PATH)
        .query({ code: 'google-auth-code', state })
        .expect(302);

      await request(app.getHttpServer())
        .delete(CALENDAR_PATH)
        .set('Authorization', `Bearer ${ownerAccessToken}`)
        .expect(200)
        .expect({ connected: false });

      expect(integrationRepository.isConnected()).toBe(false);
    });
  });
});
