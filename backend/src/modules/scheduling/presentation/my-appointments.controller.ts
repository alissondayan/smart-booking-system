import { Body, Controller, Get, Param, Patch, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { UserRole } from '../../../shared/domain/enums/user-role.enum';
import {
  AuthenticatedUser,
  CurrentUser,
} from '../../../shared/presentation/decorators/current-user.decorator';
import { Roles } from '../../../shared/presentation/decorators/roles.decorator';
import { RolesGuard } from '../../../shared/presentation/guards/roles.guard';
import { JwtAuthGuard } from '../../identity/infrastructure/auth/jwt-auth.guard';
import { CancelAppointmentUseCase } from '../application/cancel-appointment.use-case';
import { ListMyAppointmentsUseCase } from '../application/list-my-appointments.use-case';
import { RescheduleAppointmentUseCase } from '../application/reschedule-appointment.use-case';
import { AppointmentResponse } from '../application/scheduling-response';
import { AppointmentQueryDto } from './dto/appointment-query.dto';
import { RescheduleAppointmentDto } from './dto/reschedule-appointment.dto';
import { ApiStandardErrors } from '../../../shared/presentation/swagger/api-standard-errors.decorator';

@ApiTags('My Appointments')
@ApiStandardErrors()
@Controller('me/appointments')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.CUSTOMER)
@ApiBearerAuth()
export class MyAppointmentsController {
  constructor(
    private readonly listMyAppointmentsUseCase: ListMyAppointmentsUseCase,
    private readonly cancelAppointmentUseCase: CancelAppointmentUseCase,
    private readonly rescheduleAppointmentUseCase: RescheduleAppointmentUseCase,
  ) {}

  @Get()
  @ApiOkResponse({ description: 'Current customer appointments.' })
  list(
    @CurrentUser() user: AuthenticatedUser,
    @Query() query: AppointmentQueryDto,
  ): Promise<AppointmentResponse[]> {
    return this.listMyAppointmentsUseCase.list({
      customerId: user.id,
      status: query.status,
      from: query.from ? new Date(query.from) : undefined,
      to: query.to ? new Date(query.to) : undefined,
    });
  }

  @Get(':id')
  @ApiOkResponse({ description: 'Current customer appointment details.' })
  get(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
  ): Promise<AppointmentResponse> {
    return this.listMyAppointmentsUseCase.get(user.id, id);
  }

  @Patch(':id/cancel')
  @ApiOkResponse({ description: 'Cancelled appointment.' })
  cancel(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
  ): Promise<AppointmentResponse> {
    return this.cancelAppointmentUseCase.execute({
      appointmentId: id,
      customerId: user.id,
    });
  }

  @Patch(':id/reschedule')
  @ApiOkResponse({ description: 'Rescheduled appointment.' })
  reschedule(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Body() dto: RescheduleAppointmentDto,
  ): Promise<AppointmentResponse> {
    return this.rescheduleAppointmentUseCase.execute({
      appointmentId: id,
      customerId: user.id,
      newStartAt: new Date(dto.newStartAt),
    });
  }
}
