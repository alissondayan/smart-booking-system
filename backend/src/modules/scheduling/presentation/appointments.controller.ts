import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiCreatedResponse, ApiTags } from '@nestjs/swagger';
import { UserRole } from '../../../shared/domain/enums/user-role.enum';
import {
  AuthenticatedUser,
  CurrentUser,
} from '../../../shared/presentation/decorators/current-user.decorator';
import { Roles } from '../../../shared/presentation/decorators/roles.decorator';
import { RolesGuard } from '../../../shared/presentation/guards/roles.guard';
import { JwtAuthGuard } from '../../identity/infrastructure/auth/jwt-auth.guard';
import { BookAppointmentUseCase } from '../application/book-appointment.use-case';
import { AppointmentResponse } from '../application/scheduling-response';
import { BookAppointmentDto } from './dto/book-appointment.dto';
import { ApiStandardErrors } from '../../../shared/presentation/swagger/api-standard-errors.decorator';

@ApiTags('Appointments')
@ApiStandardErrors()
@Controller('appointments')
export class AppointmentsController {
  constructor(private readonly bookAppointmentUseCase: BookAppointmentUseCase) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.CUSTOMER)
  @ApiBearerAuth()
  @ApiCreatedResponse({ description: 'Booked appointment.' })
  book(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: BookAppointmentDto,
  ): Promise<AppointmentResponse> {
    return this.bookAppointmentUseCase.execute({
      customerId: user.id,
      serviceId: dto.serviceId,
      startAt: new Date(dto.startAt),
    });
  }
}
