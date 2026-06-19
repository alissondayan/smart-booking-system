import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import {
  PASSWORD_HASHER,
  PasswordHasherPort,
} from '../domain/ports/password-hasher.port';
import {
  TOKEN_SERVICE,
  TokenServicePort,
} from '../domain/ports/token.service.port';
import {
  USER_REPOSITORY,
  UserRepositoryPort,
} from '../domain/ports/user.repository.port';
import { AuthResult, toPublicUser } from './auth-result';

export interface LoginCommand {
  email: string;
  password: string;
}

@Injectable()
export class LoginUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepositoryPort,
    @Inject(PASSWORD_HASHER)
    private readonly passwordHasher: PasswordHasherPort,
    @Inject(TOKEN_SERVICE)
    private readonly tokenService: TokenServicePort,
  ) {}

  async execute(command: LoginCommand): Promise<AuthResult> {
    const user = await this.userRepository.findByEmail(
      command.email.toLowerCase(),
    );

    if (!user?.passwordHash) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const passwordMatches = await this.passwordHasher.compare(
      command.password,
      user.passwordHash,
    );

    if (!passwordMatches) {
      throw new UnauthorizedException('Invalid email or password');
    }

    await this.userRepository.deleteExpiredRefreshTokens(user.id, new Date());
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
