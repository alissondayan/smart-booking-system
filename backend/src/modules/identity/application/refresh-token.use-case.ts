import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import {
  TOKEN_SERVICE,
  TokenServicePort,
} from '../domain/ports/token.service.port';
import {
  USER_REPOSITORY,
  UserRepositoryPort,
} from '../domain/ports/user.repository.port';
import { AuthResult, toPublicUser } from './auth-result';

export interface RefreshTokenCommand {
  refreshToken: string;
}

@Injectable()
export class RefreshTokenUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepositoryPort,
    @Inject(TOKEN_SERVICE)
    private readonly tokenService: TokenServicePort,
  ) {}

  async execute(command: RefreshTokenCommand): Promise<AuthResult> {
    const tokenHash = await this.tokenService.hashRefreshToken(
      command.refreshToken,
    );
    const storedToken = await this.userRepository.findRefreshTokenByHash(
      tokenHash,
    );

    if (!storedToken || storedToken.expiresAt <= new Date()) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const user = await this.userRepository.findById(storedToken.userId);

    if (!user) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    await this.userRepository.deleteRefreshToken(storedToken.id);
    const tokens = await this.tokenService.issueTokens({
      sub: user.id,
      email: user.email,
      role: user.role,
    });

    await this.userRepository.createRefreshToken({
      userId: user.id,
      tokenHash: tokens.refreshTokenHash,
      expiresAt: tokens.refreshTokenExpiresAt,
    });

    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      user: toPublicUser(user),
    };
  }
}
