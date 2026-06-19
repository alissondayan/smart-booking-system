import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { createHash, randomBytes } from 'crypto';
import {
  AuthTokenPayload,
  IssuedTokens,
  TokenServicePort,
} from '../../domain/ports/token.service.port';

@Injectable()
export class JwtTokenService implements TokenServicePort {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async issueTokens(payload: AuthTokenPayload): Promise<IssuedTokens> {
    const refreshToken = randomBytes(64).toString('base64url');
    const refreshTokenExpiresAt = this.getRefreshTokenExpiresAt();
    const accessToken = await this.jwtService.signAsync(payload, {
      secret: this.getAccessSecret(),
      expiresIn: this.configService.get<string>('JWT_ACCESS_EXPIRES_IN') ?? '15m',
    });

    return {
      accessToken,
      refreshToken,
      refreshTokenHash: await this.hashRefreshToken(refreshToken),
      refreshTokenExpiresAt,
    };
  }

  async hashRefreshToken(refreshToken: string): Promise<string> {
    return createHash('sha256').update(refreshToken).digest('hex');
  }

  private getAccessSecret(): string {
    return this.configService.get<string>('JWT_SECRET') ?? 'development-access-secret';
  }

  private getRefreshTokenExpiresAt(): Date {
    const days = Number(
      this.configService.get<string>('JWT_REFRESH_EXPIRES_DAYS') ?? '30',
    );
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + days);

    return expiresAt;
  }
}
