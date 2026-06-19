import { Inject, Injectable } from '@nestjs/common';
import {
  TOKEN_SERVICE,
  TokenServicePort,
} from '../domain/ports/token.service.port';
import {
  USER_REPOSITORY,
  UserRepositoryPort,
} from '../domain/ports/user.repository.port';

export interface LogoutCommand {
  refreshToken: string;
}

@Injectable()
export class LogoutUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepositoryPort,
    @Inject(TOKEN_SERVICE)
    private readonly tokenService: TokenServicePort,
  ) {}

  async execute(command: LogoutCommand): Promise<void> {
    const tokenHash = await this.tokenService.hashRefreshToken(
      command.refreshToken,
    );
    const storedToken = await this.userRepository.findRefreshTokenByHash(
      tokenHash,
    );

    if (storedToken) {
      await this.userRepository.deleteRefreshToken(storedToken.id);
    }
  }
}
