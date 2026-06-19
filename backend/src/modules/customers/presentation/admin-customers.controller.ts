import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { UserRole } from '../../../shared/domain/enums/user-role.enum';
import { Roles } from '../../../shared/presentation/decorators/roles.decorator';
import { RolesGuard } from '../../../shared/presentation/guards/roles.guard';
import { JwtAuthGuard } from '../../identity/infrastructure/auth/jwt-auth.guard';
import { GetCustomerUseCase } from '../application/get-customer.use-case';
import { ListCustomersUseCase } from '../application/list-customers.use-case';
import {
  CustomerDetailsResponseDto,
  PaginatedCustomersResponseDto,
} from './dto/customer-response.dto';
import { ListCustomersQueryDto } from './dto/list-customers.query.dto';
import { ApiStandardErrors } from '../../../shared/presentation/swagger/api-standard-errors.decorator';

@ApiTags('Admin Customers')
@ApiStandardErrors()
@Controller('admin/customers')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.OWNER)
@ApiBearerAuth()
export class AdminCustomersController {
  constructor(
    private readonly listCustomersUseCase: ListCustomersUseCase,
    private readonly getCustomerUseCase: GetCustomerUseCase,
  ) {}

  @Get()
  @ApiOkResponse({ type: PaginatedCustomersResponseDto })
  list(
    @Query() query: ListCustomersQueryDto,
  ): Promise<PaginatedCustomersResponseDto> {
    return this.listCustomersUseCase.execute({
      search: query.search,
      page: query.page,
      limit: query.limit,
    });
  }

  @Get(':id')
  @ApiOkResponse({ type: CustomerDetailsResponseDto })
  get(@Param('id') id: string): Promise<CustomerDetailsResponseDto> {
    return this.getCustomerUseCase.execute(id);
  }
}
