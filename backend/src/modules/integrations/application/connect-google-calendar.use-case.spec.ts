import { ConfigService } from '@nestjs/config';
import { ConnectGoogleCalendarUseCase } from './connect-google-calendar.use-case';
import { GoogleOAuthStateService } from '../infrastructure/google/google-oauth-state.service';

const tokens = {
  accessToken: 'access-token',
  refreshToken: 'refresh-token',
  tokenExpiresAt: new Date('2026-06-20T10:00:00.000Z'),
};

function createUseCase() {
  const stateService = new GoogleOAuthStateService({
    get: (key: string) => (key === 'JWT_SECRET' ? 'test-access-secret' : undefined),
  } as unknown as ConfigService);
  const googleOAuth = {
    getAuthUrl: jest.fn(
      (state: string) => `https://accounts.google.com/o/oauth2/v2/auth?state=${state}`,
    ),
    exchangeCode: jest.fn().mockResolvedValue(tokens),
  };
  const integrationRepository = {
    findGoogle: jest.fn().mockResolvedValue(null),
    saveGoogle: jest.fn().mockResolvedValue(undefined),
    deleteGoogle: jest.fn().mockResolvedValue(undefined),
  };
  const useCase = new ConnectGoogleCalendarUseCase(
    googleOAuth as never,
    integrationRepository as never,
    stateService,
  );

  return { useCase, stateService, googleOAuth, integrationRepository };
}

describe('ConnectGoogleCalendarUseCase', () => {
  it('embeds a verifiable state in the Google authorization URL', () => {
    const { useCase, stateService, googleOAuth } = createUseCase();

    const { authUrl } = useCase.getAuthUrl('owner-id');

    const state = googleOAuth.getAuthUrl.mock.calls[0][0];
    expect(state).toBeTruthy();
    expect(authUrl).toContain(`state=${state}`);
    expect(stateService.verify(state)).toMatchObject({ userId: 'owner-id' });
  });

  it('exchanges the code and persists the connection for a valid state', async () => {
    const { useCase, stateService, googleOAuth, integrationRepository } =
      createUseCase();

    const result = await useCase.handleCallback({
      code: 'auth-code',
      state: stateService.issue('owner-id'),
    });

    expect(result).toEqual({ status: 'connected' });
    expect(googleOAuth.exchangeCode).toHaveBeenCalledWith('auth-code');
    expect(integrationRepository.saveGoogle).toHaveBeenCalledWith({
      ...tokens,
      calendarId: 'primary',
    });
  });

  it.each([
    ['missing', undefined],
    ['malformed', 'not-a-state'],
    ['signed with another secret', 'Zm9v.YmFy'],
  ])('persists nothing when the state is %s', async (_label, state) => {
    const { useCase, googleOAuth, integrationRepository } = createUseCase();

    const result = await useCase.handleCallback({ code: 'auth-code', state });

    expect(result).toEqual({ status: 'error', reason: 'invalid_state' });
    expect(googleOAuth.exchangeCode).not.toHaveBeenCalled();
    expect(integrationRepository.saveGoogle).not.toHaveBeenCalled();
  });

  it('persists nothing when the state payload was tampered with', async () => {
    const { useCase, stateService, googleOAuth, integrationRepository } =
      createUseCase();
    const [, signature] = stateService.issue('owner-id').split('.');
    const forgedPayload = Buffer.from(
      JSON.stringify({
        userId: 'attacker-id',
        nonce: 'forged',
        expiresAt: Date.now() + 60_000,
      }),
      'utf8',
    ).toString('base64url');

    const result = await useCase.handleCallback({
      code: 'auth-code',
      state: `${forgedPayload}.${signature}`,
    });

    expect(result).toEqual({ status: 'error', reason: 'invalid_state' });
    expect(googleOAuth.exchangeCode).not.toHaveBeenCalled();
    expect(integrationRepository.saveGoogle).not.toHaveBeenCalled();
  });

  it('persists nothing when the state has expired', async () => {
    const { useCase, stateService, googleOAuth, integrationRepository } =
      createUseCase();
    const expiredState = stateService.issue(
      'owner-id',
      Date.now() - 10 * 60 * 1000,
    );

    const result = await useCase.handleCallback({
      code: 'auth-code',
      state: expiredState,
    });

    expect(result).toEqual({ status: 'error', reason: 'invalid_state' });
    expect(googleOAuth.exchangeCode).not.toHaveBeenCalled();
    expect(integrationRepository.saveGoogle).not.toHaveBeenCalled();
  });

  it('reports denied consent without exchanging anything', async () => {
    const { useCase, googleOAuth, integrationRepository } = createUseCase();

    const result = await useCase.handleCallback({ error: 'access_denied' });

    expect(result).toEqual({ status: 'error', reason: 'access_denied' });
    expect(googleOAuth.exchangeCode).not.toHaveBeenCalled();
    expect(integrationRepository.saveGoogle).not.toHaveBeenCalled();
  });

  it('maps any other Google error to a generic failure', async () => {
    const { useCase } = createUseCase();

    await expect(
      useCase.handleCallback({ error: 'server_error' }),
    ).resolves.toEqual({ status: 'error', reason: 'connection_failed' });
  });

  it('persists nothing when a valid state arrives without a code', async () => {
    const { useCase, stateService, googleOAuth, integrationRepository } =
      createUseCase();

    const result = await useCase.handleCallback({
      state: stateService.issue('owner-id'),
    });

    expect(result).toEqual({ status: 'error', reason: 'connection_failed' });
    expect(googleOAuth.exchangeCode).not.toHaveBeenCalled();
    expect(integrationRepository.saveGoogle).not.toHaveBeenCalled();
  });

  it('persists nothing when the token exchange fails', async () => {
    const { useCase, stateService, googleOAuth, integrationRepository } =
      createUseCase();
    googleOAuth.exchangeCode.mockRejectedValue(new Error('invalid_grant'));

    const result = await useCase.handleCallback({
      code: 'auth-code',
      state: stateService.issue('owner-id'),
    });

    expect(result).toEqual({ status: 'error', reason: 'connection_failed' });
    expect(integrationRepository.saveGoogle).not.toHaveBeenCalled();
  });
});
