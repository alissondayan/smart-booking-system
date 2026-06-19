import { Controller, Get, Param } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { ListServicesUseCase } from '../application/list-services.use-case';
import { ServiceResponse } from '../application/service-response';
import { ApiStandardErrors } from '../../../shared/presentation/swagger/api-standard-errors.decorator';

@ApiTags('Services')
@ApiStandardErrors()
@Controller('services')
export class ServicesController {
  constructor(private readonly listServicesUseCase: ListServicesUseCase) {}

  @Get()
  @ApiOkResponse({ description: 'Active services.' })
  listActive(): Promise<ServiceResponse[]> {
    return this.listServicesUseCase.listActive();
  }

  @Get(':id')
  @ApiOkResponse({ description: 'Active service details.' })
  getById(@Param('id') id: string): Promise<ServiceResponse> {
    return this.listServicesUseCase.getActiveById(id);
  }
}
