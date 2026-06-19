import { Body, Controller, Delete, Get, Param, Post, Put, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiCreatedResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { UserRole } from '../../../shared/domain/enums/user-role.enum';
import { Roles } from '../../../shared/presentation/decorators/roles.decorator';
import { RolesGuard } from '../../../shared/presentation/guards/roles.guard';
import { JwtAuthGuard } from '../../identity/infrastructure/auth/jwt-auth.guard';
import { CreateBlockedTimeUseCase } from '../application/create-blocked-time.use-case';
import { CreateHolidayUseCase } from '../application/create-holiday.use-case';
import { SetAvailabilityRuleUseCase } from '../application/set-availability-rule.use-case';
import { SetDateAvailabilityUseCase } from '../application/set-date-availability.use-case';
import {
  AvailabilityRuleResponse,
  BlockedTimeResponse,
  DateAvailabilityResponse,
  HolidayResponse,
} from '../application/scheduling-response';
import { AppointmentQueryDto } from './dto/appointment-query.dto';
import { CreateBlockedTimeDto } from './dto/create-blocked-time.dto';
import { CreateHolidayDto } from './dto/create-holiday.dto';
import { SetAvailabilityRuleDto } from './dto/set-availability-rule.dto';
import { SetDateAvailabilityDto } from './dto/set-date-availability.dto';

@ApiTags('Admin Availability')
@Controller()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.OWNER)
@ApiBearerAuth()
export class AdminAvailabilityController {
  constructor(
    private readonly setAvailabilityRuleUseCase: SetAvailabilityRuleUseCase,
    private readonly setDateAvailabilityUseCase: SetDateAvailabilityUseCase,
    private readonly createBlockedTimeUseCase: CreateBlockedTimeUseCase,
    private readonly createHolidayUseCase: CreateHolidayUseCase,
  ) {}

  @Get('admin/availability/rules')
  @ApiOkResponse({ description: 'Weekly availability rules.' })
  listRules(): Promise<AvailabilityRuleResponse[]> {
    return this.setAvailabilityRuleUseCase.list();
  }

  @Put('admin/availability/rules')
  @ApiOkResponse({ description: 'Replaced weekly availability rules.' })
  replaceRules(
    @Body() dto: SetAvailabilityRuleDto,
  ): Promise<AvailabilityRuleResponse[]> {
    return this.setAvailabilityRuleUseCase.replace(dto.rules);
  }

  @Get('admin/availability/dates')
  @ApiOkResponse({ description: 'Date-specific availability overrides.' })
  listDateOverrides(
    @Query() query: AppointmentQueryDto,
  ): Promise<DateAvailabilityResponse[]> {
    return this.setDateAvailabilityUseCase.list(
      query.from ? new Date(query.from) : undefined,
      query.to ? new Date(query.to) : undefined,
    );
  }

  @Put('admin/availability/dates/:date')
  @ApiOkResponse({ description: 'Saved date-specific availability override.' })
  setDateOverride(
    @Param('date') date: string,
    @Body() dto: SetDateAvailabilityDto,
  ): Promise<DateAvailabilityResponse> {
    return this.setDateAvailabilityUseCase.set({
      date: new Date(`${date}T00:00:00.000Z`),
      startTime: dto.startTime,
      endTime: dto.endTime,
      isClosed: dto.isClosed,
    });
  }

  @Delete('admin/availability/dates/:date')
  @ApiOkResponse({ description: 'Deleted date-specific override.' })
  async deleteDateOverride(@Param('date') date: string): Promise<{ success: true }> {
    await this.setDateAvailabilityUseCase.delete(
      new Date(`${date}T00:00:00.000Z`),
    );

    return { success: true };
  }

  @Get('admin/blocked-times')
  @ApiOkResponse({ description: 'Blocked time ranges.' })
  listBlockedTimes(
    @Query() query: AppointmentQueryDto,
  ): Promise<BlockedTimeResponse[]> {
    return this.createBlockedTimeUseCase.list(
      query.from ? new Date(query.from) : undefined,
      query.to ? new Date(query.to) : undefined,
    );
  }

  @Post('admin/blocked-times')
  @ApiCreatedResponse({ description: 'Created blocked time.' })
  createBlockedTime(
    @Body() dto: CreateBlockedTimeDto,
  ): Promise<BlockedTimeResponse> {
    return this.createBlockedTimeUseCase.create({
      startAt: new Date(dto.startAt),
      endAt: new Date(dto.endAt),
      reason: dto.reason,
    });
  }

  @Delete('admin/blocked-times/:id')
  @ApiOkResponse({ description: 'Deleted blocked time.' })
  async deleteBlockedTime(@Param('id') id: string): Promise<{ success: true }> {
    await this.createBlockedTimeUseCase.delete(id);

    return { success: true };
  }

  @Get('admin/holidays')
  @ApiOkResponse({ description: 'Holidays.' })
  listHolidays(): Promise<HolidayResponse[]> {
    return this.createHolidayUseCase.list();
  }

  @Post('admin/holidays')
  @ApiCreatedResponse({ description: 'Created holiday.' })
  createHoliday(@Body() dto: CreateHolidayDto): Promise<HolidayResponse> {
    return this.createHolidayUseCase.create({
      date: new Date(`${dto.date}T00:00:00.000Z`),
      label: dto.label,
    });
  }

  @Delete('admin/holidays/:id')
  @ApiOkResponse({ description: 'Deleted holiday.' })
  async deleteHoliday(@Param('id') id: string): Promise<{ success: true }> {
    await this.createHolidayUseCase.delete(id);

    return { success: true };
  }
}
