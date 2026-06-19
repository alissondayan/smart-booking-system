import { Controller, Get, Query } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { GetAvailableSlotsUseCase } from '../application/get-available-slots.use-case';
import { SlotResponse } from '../application/scheduling-response';
import { GetAvailabilityQueryDto } from './dto/get-availability.query.dto';
import { ApiStandardErrors } from '../../../shared/presentation/swagger/api-standard-errors.decorator';

@ApiTags('Availability')
@ApiStandardErrors()
@Controller('availability')
export class AvailabilityController {
  constructor(
    private readonly getAvailableSlotsUseCase: GetAvailableSlotsUseCase,
  ) {}

  @Get()
  @ApiOkResponse({ description: 'Available slots for service and date.' })
  getAvailableSlots(
    @Query() query: GetAvailabilityQueryDto,
  ): Promise<SlotResponse[]> {
    return this.getAvailableSlotsUseCase.execute(query);
  }
}
