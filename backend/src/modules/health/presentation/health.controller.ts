import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { HealthCheckResult, HealthService } from '../health.service';

@ApiTags('System')
@Controller('health')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Get()
  @ApiOkResponse({ description: 'Database and Redis are reachable.' })
  check(): Promise<HealthCheckResult> {
    return this.healthService.check();
  }
}
