import { Body, Controller, Delete, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiCreatedResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { UserRole } from '../../../shared/domain/enums/user-role.enum';
import {
  AuthenticatedUser,
  CurrentUser,
} from '../../../shared/presentation/decorators/current-user.decorator';
import { Roles } from '../../../shared/presentation/decorators/roles.decorator';
import { RolesGuard } from '../../../shared/presentation/guards/roles.guard';
import { JwtAuthGuard } from '../../identity/infrastructure/auth/jwt-auth.guard';
import { JoinWaitlistUseCase } from '../application/join-waitlist.use-case';
import { ListWaitlistUseCase } from '../application/list-waitlist.use-case';
import { WaitlistEntryResponse } from '../application/waitlist-response';
import { JoinWaitlistDto } from './dto/join-waitlist.dto';

@ApiTags('Waitlist')
@Controller()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.CUSTOMER)
@ApiBearerAuth()
export class WaitlistController {
  constructor(
    private readonly joinWaitlistUseCase: JoinWaitlistUseCase,
    private readonly listWaitlistUseCase: ListWaitlistUseCase,
  ) {}

  @Post('waitlist')
  @ApiCreatedResponse({ description: 'Joined waitlist.' })
  join(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: JoinWaitlistDto,
  ): Promise<WaitlistEntryResponse> {
    return this.joinWaitlistUseCase.execute({
      customerId: user.id,
      serviceId: dto.serviceId,
      preferredDate: dto.preferredDate
        ? new Date(`${dto.preferredDate}T00:00:00.000Z`)
        : null,
    });
  }

  @Get('me/waitlist')
  @ApiOkResponse({ description: 'Current customer waitlist entries.' })
  listMine(
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<WaitlistEntryResponse[]> {
    return this.listWaitlistUseCase.list({ customerId: user.id });
  }

  @Delete('me/waitlist/:id')
  @ApiOkResponse({ description: 'Cancelled waitlist entry.' })
  cancelMine(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
  ): Promise<WaitlistEntryResponse> {
    return this.listWaitlistUseCase.cancelForCustomer(id, user.id);
  }
}
