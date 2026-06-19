import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiCreatedResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { UserRole } from '../../../shared/domain/enums/user-role.enum';
import { Roles } from '../../../shared/presentation/decorators/roles.decorator';
import { RolesGuard } from '../../../shared/presentation/guards/roles.guard';
import { JwtAuthGuard } from '../../identity/infrastructure/auth/jwt-auth.guard';
import { CreateServiceUseCase } from '../application/create-service.use-case';
import { DeleteServiceUseCase } from '../application/delete-service.use-case';
import { ListServicesUseCase } from '../application/list-services.use-case';
import { ServiceResponse } from '../application/service-response';
import { UpdateServiceUseCase } from '../application/update-service.use-case';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
import { ApiStandardErrors } from '../../../shared/presentation/swagger/api-standard-errors.decorator';

@ApiTags('Admin Services')
@ApiStandardErrors()
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.OWNER)
@Controller('admin/services')
export class AdminServicesController {
  constructor(
    private readonly listServicesUseCase: ListServicesUseCase,
    private readonly createServiceUseCase: CreateServiceUseCase,
    private readonly updateServiceUseCase: UpdateServiceUseCase,
    private readonly deleteServiceUseCase: DeleteServiceUseCase,
  ) {}

  @Get()
  @ApiOkResponse({ description: 'All services including inactive services.' })
  listAll(): Promise<ServiceResponse[]> {
    return this.listServicesUseCase.listAll();
  }

  @Post()
  @ApiCreatedResponse({ description: 'Created service.' })
  create(@Body() dto: CreateServiceDto): Promise<ServiceResponse> {
    return this.createServiceUseCase.execute(dto);
  }

  @Patch(':id')
  @ApiOkResponse({ description: 'Updated service.' })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateServiceDto,
  ): Promise<ServiceResponse> {
    return this.updateServiceUseCase.execute(id, dto);
  }

  @Delete(':id')
  @ApiOkResponse({ description: 'Soft-deleted service.' })
  delete(@Param('id') id: string): Promise<ServiceResponse> {
    return this.deleteServiceUseCase.execute(id);
  }
}
