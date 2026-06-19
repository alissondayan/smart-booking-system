import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import {
  AuthenticatedUser,
  CurrentUser,
} from '../../../shared/presentation/decorators/current-user.decorator';
import { GetMeUseCase } from '../application/get-me.use-case';
import { GoogleLoginUseCase } from '../application/google-login.use-case';
import { LoginUseCase } from '../application/login.use-case';
import { LogoutUseCase } from '../application/logout.use-case';
import { RefreshTokenUseCase } from '../application/refresh-token.use-case';
import { RegisterUseCase } from '../application/register.use-case';
import { GoogleAuthGuard } from '../infrastructure/auth/google-auth.guard';
import { GoogleOAuthUser } from '../infrastructure/auth/google.strategy';
import { JwtAuthGuard } from '../infrastructure/auth/jwt-auth.guard';
import { AuthResponseDto, AuthUserResponseDto } from './dto/auth-response.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { RegisterDto } from './dto/register.dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly registerUseCase: RegisterUseCase,
    private readonly loginUseCase: LoginUseCase,
    private readonly refreshTokenUseCase: RefreshTokenUseCase,
    private readonly logoutUseCase: LogoutUseCase,
    private readonly getMeUseCase: GetMeUseCase,
    private readonly googleLoginUseCase: GoogleLoginUseCase,
  ) {}

  @Post('register')
  @ApiOkResponse({ type: AuthResponseDto })
  register(@Body() dto: RegisterDto): Promise<AuthResponseDto> {
    return this.registerUseCase.execute(dto);
  }

  @Post('login')
  @ApiOkResponse({ type: AuthResponseDto })
  @ApiUnauthorizedResponse({ description: 'Invalid email or password.' })
  login(@Body() dto: LoginDto): Promise<AuthResponseDto> {
    return this.loginUseCase.execute(dto);
  }

  @Get('google')
  @UseGuards(GoogleAuthGuard)
  googleAuth(): void {
    // Passport redirects the request to Google.
  }

  @Get('google/callback')
  @UseGuards(GoogleAuthGuard)
  @ApiOkResponse({ type: AuthResponseDto })
  googleCallback(
    @CurrentUser() user: GoogleOAuthUser,
  ): Promise<AuthResponseDto> {
    return this.googleLoginUseCase.execute(user);
  }

  @Post('refresh')
  @ApiOkResponse({ type: AuthResponseDto })
  refresh(@Body() dto: RefreshTokenDto): Promise<AuthResponseDto> {
    return this.refreshTokenUseCase.execute(dto);
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOkResponse({ description: 'Refresh token revoked.' })
  async logout(@Body() dto: RefreshTokenDto): Promise<{ success: true }> {
    await this.logoutUseCase.execute(dto);

    return { success: true };
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOkResponse({ type: AuthUserResponseDto })
  me(@CurrentUser() user: AuthenticatedUser): Promise<AuthUserResponseDto> {
    return this.getMeUseCase.execute(user.id);
  }
}
