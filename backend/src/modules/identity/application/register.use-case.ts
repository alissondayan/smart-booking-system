import { ConflictException, Inject, Injectable } from '@nestjs/common';
import { UserRole } from '../../../shared/domain/enums/user-role.enum';
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

export interface RegisterCommand {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
}

@Injectable()
export class RegisterUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepositoryPort,
    @Inject(PASSWORD_HASHER)
    private readonly passwordHasher: PasswordHasherPort,
    @Inject(TOKEN_SERVICE)
    private readonly tokenService: TokenServicePort,
  ) {}

  async execute(command: RegisterCommand): Promise<AuthResult> {
    const email = command.email.toLowerCase();
    const existingUser = await this.userRepository.findByEmail(email);

    if (existingUser) {
      throw new ConflictException('Email is already registered');
    }

    const passwordHash = await this.passwordHasher.hash(command.password);
    const user = await this.userRepository.create({
      email,
      passwordHash,
      role: UserRole.CUSTOMER,
      firstName: command.firstName,
      lastName: command.lastName,
      phone: command.phone,
    });
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
