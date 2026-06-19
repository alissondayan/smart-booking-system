import { Inject, Injectable } from '@nestjs/common';
import { UserRole } from '../../../shared/domain/enums/user-role.enum';
import {
  TOKEN_SERVICE,
  TokenServicePort,
} from '../domain/ports/token.service.port';
import {
  USER_REPOSITORY,
  UserRepositoryPort,
} from '../domain/ports/user.repository.port';
import { GoogleOAuthUser } from '../infrastructure/auth/google.strategy';
import { AuthResult, toPublicUser } from './auth-result';

@Injectable()
export class GoogleLoginUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepositoryPort,
    @Inject(TOKEN_SERVICE)
    private readonly tokenService: TokenServicePort,
  ) {}

  async execute(profile: GoogleOAuthUser): Promise<AuthResult> {
    const email = profile.email.toLowerCase();
    const existingGoogleUser = await this.userRepository.findByGoogleId(
      profile.googleId,
    );
    const existingEmailUser =
      existingGoogleUser ?? (await this.userRepository.findByEmail(email));
    const user =
      existingEmailUser ??
      (await this.userRepository.create({
        email,
        googleId: profile.googleId,
        role: UserRole.CUSTOMER,
        firstName: profile.firstName,
        lastName: profile.lastName,
      }));
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
