import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { PASSWORD_HASHER } from './domain/ports/password-hasher.port';
import { TOKEN_SERVICE } from './domain/ports/token.service.port';
import { USER_REPOSITORY } from './domain/ports/user.repository.port';
import { GetMeUseCase } from './application/get-me.use-case';
import { GoogleLoginUseCase } from './application/google-login.use-case';
import { LoginUseCase } from './application/login.use-case';
import { LogoutUseCase } from './application/logout.use-case';
import { RefreshTokenUseCase } from './application/refresh-token.use-case';
import { RegisterUseCase } from './application/register.use-case';
import { GoogleAuthGuard } from './infrastructure/auth/google-auth.guard';
import { GoogleStrategy } from './infrastructure/auth/google.strategy';
import { JwtAuthGuard } from './infrastructure/auth/jwt-auth.guard';
import { JwtStrategy } from './infrastructure/auth/jwt.strategy';
import { JwtTokenService } from './infrastructure/auth/jwt-token.service';
import { BcryptService } from './infrastructure/hashing/bcrypt.service';
import { PrismaUserRepository } from './infrastructure/persistence/prisma-user.repository';
import { AuthController } from './presentation/auth.controller';

@Module({
  imports: [ConfigModule, PassportModule, JwtModule.register({})],
  controllers: [AuthController],
  providers: [
    RegisterUseCase,
    LoginUseCase,
    RefreshTokenUseCase,
    LogoutUseCase,
    GetMeUseCase,
    GoogleLoginUseCase,
    JwtStrategy,
    GoogleStrategy,
    JwtAuthGuard,
    GoogleAuthGuard,
    {
      provide: USER_REPOSITORY,
      useClass: PrismaUserRepository,
    },
    {
      provide: PASSWORD_HASHER,
      useClass: BcryptService,
    },
    {
      provide: TOKEN_SERVICE,
      useClass: JwtTokenService,
    },
  ],
  exports: [JwtAuthGuard, GoogleAuthGuard],
})
export class IdentityModule {}
