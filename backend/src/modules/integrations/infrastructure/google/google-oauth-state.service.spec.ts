import { ConfigService } from '@nestjs/config';
import { GoogleOAuthStateService } from './google-oauth-state.service';

function createService(secret = 'test-access-secret'): GoogleOAuthStateService {
  return new GoogleOAuthStateService({
    get: (key: string) => (key === 'JWT_SECRET' ? secret : undefined),
  } as unknown as ConfigService);
}

describe('GoogleOAuthStateService', () => {
  it('issues a state that verifies back to the owner who started the flow', () => {
    const service = createService();

    const state = service.issue('owner-id');

    expect(service.verify(state)).toMatchObject({ userId: 'owner-id' });
  });

  it('issues a different state per call', () => {
    const service = createService();

    expect(service.issue('owner-id')).not.toBe(service.issue('owner-id'));
  });

  it('rejects a missing state', () => {
    expect(createService().verify(undefined)).toBeNull();
    expect(createService().verify('')).toBeNull();
  });

  it('rejects a malformed state', () => {
    const service = createService();

    expect(service.verify('not-a-state')).toBeNull();
    expect(service.verify('a.b.c')).toBeNull();
  });

  it('rejects a tampered payload', () => {
    const service = createService();
    const [, signature] = service.issue('owner-id').split('.');
    const forgedPayload = Buffer.from(
      JSON.stringify({
        userId: 'attacker-id',
        nonce: 'forged',
        expiresAt: Date.now() + 60_000,
      }),
      'utf8',
    ).toString('base64url');

    expect(service.verify(`${forgedPayload}.${signature}`)).toBeNull();
  });

  it('rejects a state signed with a different secret', () => {
    const state = createService('other-secret').issue('owner-id');

    expect(createService().verify(state)).toBeNull();
  });

  it('rejects a state older than five minutes', () => {
    const service = createService();
    const issuedAt = Date.now();
    const state = service.issue('owner-id', issuedAt);

    expect(service.verify(state, issuedAt + 4 * 60 * 1000)).not.toBeNull();
    expect(service.verify(state, issuedAt + 5 * 60 * 1000 + 1)).toBeNull();
  });
});
