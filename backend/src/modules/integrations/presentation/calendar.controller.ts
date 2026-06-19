import { Controller, Delete, Get, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { UserRole } from '../../../shared/domain/enums/user-role.enum';
import { Roles } from '../../../shared/presentation/decorators/roles.decorator';
import { RolesGuard } from '../../../shared/presentation/guards/roles.guard';
import { JwtAuthGuard } from '../../identity/infrastructure/auth/jwt-auth.guard';
import { ConnectGoogleCalendarUseCase } from '../application/connect-google-calendar.use-case';
import { ConnectGoogleCalendarDto } from './dto/connect-google-calendar.dto';
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
  connect(): { authUrl: string } {
    return this.connectGoogleCalendarUseCase.getAuthUrl();
  }

  @Get('google/callback')
  @ApiOkResponse({ description: 'Google Calendar connected.' })
  callbackFromQuery(
    @Query() query: ConnectGoogleCalendarDto,
  ): Promise<{ connected: true }> {
    return this.connectGoogleCalendarUseCase.connect(query.code);
  }

  @Delete()
  @ApiOkResponse({ description: 'Google Calendar disconnected.' })
  disconnect(): Promise<{ connected: false }> {
    return this.connectGoogleCalendarUseCase.disconnect();
  }
}
