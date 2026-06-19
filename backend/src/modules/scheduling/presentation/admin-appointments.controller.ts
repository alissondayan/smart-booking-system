import { Body, Controller, Get, Param, Patch, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { UserRole } from '../../../shared/domain/enums/user-role.enum';
import { Roles } from '../../../shared/presentation/decorators/roles.decorator';
import { RolesGuard } from '../../../shared/presentation/guards/roles.guard';
import { JwtAuthGuard } from '../../identity/infrastructure/auth/jwt-auth.guard';
import { CancelAppointmentUseCase } from '../application/cancel-appointment.use-case';
import { ListAdminAppointmentsUseCase } from '../application/list-admin-appointments.use-case';
import { AppointmentResponse } from '../application/scheduling-response';
import { AppointmentQueryDto } from './dto/appointment-query.dto';
import { UpdateAppointmentNotesDto } from './dto/update-appointment-notes.dto';
import { ApiStandardErrors } from '../../../shared/presentation/swagger/api-standard-errors.decorator';

@ApiTags('Admin Appointments')
@ApiStandardErrors()
@Controller('admin/appointments')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.OWNER)
@ApiBearerAuth()
export class AdminAppointmentsController {
  constructor(
    private readonly listAdminAppointmentsUseCase: ListAdminAppointmentsUseCase,
    private readonly cancelAppointmentUseCase: CancelAppointmentUseCase,
  ) {}

  @Get()
  @ApiOkResponse({ description: 'Owner appointment calendar.' })
  list(@Query() query: AppointmentQueryDto): Promise<AppointmentResponse[]> {
    return this.listAdminAppointmentsUseCase.list({
      status: query.status,
      date: query.date ? new Date(`${query.date}T00:00:00.000Z`) : undefined,
      from: query.from ? new Date(query.from) : undefined,
      to: query.to ? new Date(query.to) : undefined,
    });
  }

  @Get(':id')
  @ApiOkResponse({ description: 'Appointment details.' })
  get(@Param('id') id: string): Promise<AppointmentResponse> {
    return this.listAdminAppointmentsUseCase.get(id);
  }

  @Patch(':id/cancel')
  @ApiOkResponse({ description: 'Cancelled appointment.' })
  cancel(@Param('id') id: string): Promise<AppointmentResponse> {
    return this.cancelAppointmentUseCase.execute({ appointmentId: id });
  }

  @Patch(':id/notes')
  @ApiOkResponse({ description: 'Updated appointment notes.' })
  updateNotes(
    @Param('id') id: string,
    @Body() dto: UpdateAppointmentNotesDto,
  ): Promise<AppointmentResponse> {
    return this.listAdminAppointmentsUseCase.updateNotes(id, dto.notes ?? null);
  }
}
