import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createHmac, randomBytes, timingSafeEqual } from 'crypto';

const STATE_TTL_MS = 5 * 60 * 1000;

export interface GoogleOAuthStatePayload {
  userId: string;
  nonce: string;
  expiresAt: number;
}

function encodeSegment(value: string): string {
  return Buffer.from(value, 'utf8').toString('base64url');
}

function decodeSegment(value: string): string {
  return Buffer.from(value, 'base64url').toString('utf8');
}

function isStatePayload(value: unknown): value is GoogleOAuthStatePayload {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const candidate = value as Partial<GoogleOAuthStatePayload>;

  return (
    typeof candidate.userId === 'string' &&
    candidate.userId.length > 0 &&
    typeof candidate.nonce === 'string' &&
    candidate.nonce.length > 0 &&
    typeof candidate.expiresAt === 'number' &&
    Number.isFinite(candidate.expiresAt)
  );
}

@Injectable()
export class GoogleOAuthStateService {
  private readonly secret: string;

  constructor(configService: ConfigService) {
    this.secret =
      configService.get<string>('JWT_SECRET') ?? 'development-access-secret';
  }

  issue(userId: string, now: number = Date.now()): string {
    const payload: GoogleOAuthStatePayload = {
      userId,
      nonce: randomBytes(16).toString('hex'),
      expiresAt: now + STATE_TTL_MS,
    };
    const encodedPayload = encodeSegment(JSON.stringify(payload));

    return `${encodedPayload}.${this.sign(encodedPayload)}`;
  }

  verify(
    state: string | undefined,
    now: number = Date.now(),
  ): GoogleOAuthStatePayload | null {
    if (!state) {
      return null;
    }

    const segments = state.split('.');

    if (segments.length !== 2) {
      return null;
    }

    const [encodedPayload, signature] = segments;

    if (!this.isValidSignature(encodedPayload, signature)) {
      return null;
    }

    const payload = this.decodePayload(encodedPayload);

    if (!payload || payload.expiresAt <= now) {
      return null;
    }

    return payload;
  }

  private decodePayload(
    encodedPayload: string,
  ): GoogleOAuthStatePayload | null {
    try {
      const payload: unknown = JSON.parse(decodeSegment(encodedPayload));

      return isStatePayload(payload) ? payload : null;
    } catch {
      return null;
    }
  }

  private isValidSignature(
    encodedPayload: string,
    signature: string,
  ): boolean {
    const expected = Buffer.from(this.sign(encodedPayload), 'utf8');
    const received = Buffer.from(signature, 'utf8');

    if (expected.length !== received.length) {
      return false;
    }

    return timingSafeEqual(expected, received);
  }

  private sign(encodedPayload: string): string {
    return createHmac('sha256', this.secret)
      .update(encodedPayload)
      .digest('base64url');
  }
}
