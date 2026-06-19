import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { UserRole } from '../../../shared/domain/enums/user-role.enum';
import { Roles } from '../../../shared/presentation/decorators/roles.decorator';
import { RolesGuard } from '../../../shared/presentation/guards/roles.guard';
import { JwtAuthGuard } from '../../identity/infrastructure/auth/jwt-auth.guard';
import { ListWaitlistUseCase } from '../application/list-waitlist.use-case';
import { WaitlistEntryResponse } from '../application/waitlist-response';
import { WaitlistQueryDto } from './dto/waitlist-query.dto';
import { ApiStandardErrors } from '../../../shared/presentation/swagger/api-standard-errors.decorator';

@ApiTags('Admin Waitlist')
@ApiStandardErrors()
@Controller('admin/waitlist')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.OWNER)
@ApiBearerAuth()
export class AdminWaitlistController {
  constructor(private readonly listWaitlistUseCase: ListWaitlistUseCase) {}

  @Get()
  @ApiOkResponse({ description: 'All waitlist entries.' })
  list(@Query() query: WaitlistQueryDto): Promise<WaitlistEntryResponse[]> {
    return this.listWaitlistUseCase.list({
      serviceId: query.serviceId,
      status: query.status,
    });
  }
}
