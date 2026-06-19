import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { HealthCheckResult, HealthService } from '../health.service';
import { ApiStandardErrors } from '../../../shared/presentation/swagger/api-standard-errors.decorator';

@ApiTags('System')
@ApiStandardErrors()
@Controller('health')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Get()
  @ApiOkResponse({ description: 'Database and Redis are reachable.' })
  check(): Promise<HealthCheckResult> {
    return this.healthService.check();
  }
}
