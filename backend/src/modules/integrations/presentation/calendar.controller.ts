import { Controller, Delete, Get, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { UserRole } from '../../../shared/domain/enums/user-role.enum';
import {
  AuthenticatedUser,
  CurrentUser,
} from '../../../shared/presentation/decorators/current-user.decorator';
import { Roles } from '../../../shared/presentation/decorators/roles.decorator';
import { RolesGuard } from '../../../shared/presentation/guards/roles.guard';
import { JwtAuthGuard } from '../../identity/infrastructure/auth/jwt-auth.guard';
import { ConnectGoogleCalendarUseCase } from '../application/connect-google-calendar.use-case';
import { ApiStandardErrors } from '../../../shared/presentation/swagger/api-standard-errors.decorator';

@ApiTags('Admin Integrations')
@ApiStandardErrors()
@Controller('admin/integrations/calendar')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.OWNER)
@ApiBearerAuth()
export class CalendarController {
  constructor(
    private readonly connectGoogleCalendarUseCase: ConnectGoogleCalendarUseCase,
  ) {}

  @Get()
  @ApiOkResponse({ description: 'Google Calendar connection status.' })
  status(): Promise<{ connected: boolean; calendarId?: string | null }> {
    return this.connectGoogleCalendarUseCase.status();
  }

  @Post('google/connect')
  @ApiOkResponse({ description: 'Google OAuth authorization URL.' })
  connect(@CurrentUser() user: AuthenticatedUser): { authUrl: string } {
    return this.connectGoogleCalendarUseCase.getAuthUrl(user.id);
  }

  @Delete()
  @ApiOkResponse({ description: 'Google Calendar disconnected.' })
  disconnect(): Promise<{ connected: false }> {
    return this.connectGoogleCalendarUseCase.disconnect();
  }
}
