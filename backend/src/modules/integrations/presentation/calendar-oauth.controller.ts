import { Controller, Get, Logger, Query, Redirect } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiExcludeEndpoint, ApiTags } from '@nestjs/swagger';
import { ConnectGoogleCalendarUseCase } from '../application/connect-google-calendar.use-case';

const DEFAULT_FRONTEND_URL = 'http://localhost:3001';
const INTEGRATIONS_PATH = '/admin/integrations';

/**
 * Google redirects the browser here as a top-level navigation with no
 * Authorization header, so this controller must stay free of JwtAuthGuard.
 * The owner is authenticated earlier, when the signed OAuth state is issued by
 * the guarded POST /admin/integrations/calendar/google/connect endpoint.
 */
@ApiTags('Admin Integrations')
@Controller('admin/integrations/calendar/google')
export class CalendarOAuthController {
  private readonly logger = new Logger(CalendarOAuthController.name);

  constructor(
    private readonly connectGoogleCalendarUseCase: ConnectGoogleCalendarUseCase,
    private readonly configService: ConfigService,
  ) {}

  @Get('callback')
  @ApiExcludeEndpoint()
  @Redirect()
  async callback(
    @Query('code') code?: string,
    @Query('state') state?: string,
    @Query('error') error?: string,
  ): Promise<{ url: string; statusCode: number }> {
    const result = await this.connectGoogleCalendarUseCase.handleCallback({
      code,
      state,
      error,
    });

    const params: Record<string, string> =
      result.status === 'connected'
        ? { calendar: 'connected' }
        : { calendar: 'error', reason: result.reason };

    return { url: this.buildRedirectUrl(params), statusCode: 302 };
  }

  private buildRedirectUrl(params: Record<string, string>): string {
    const url = new URL(INTEGRATIONS_PATH, this.resolveFrontendOrigin());

    Object.entries(params).forEach(([key, value]) =>
      url.searchParams.set(key, value),
    );

    return url.toString();
  }

  private resolveFrontendOrigin(): string {
    const configured = this.configService.get<string>('FRONTEND_URL');

    if (!configured) {
      return DEFAULT_FRONTEND_URL;
    }

    try {
      return new URL(configured).origin;
    } catch {
      this.logger.error('FRONTEND_URL is not a valid URL, using the default');

      return DEFAULT_FRONTEND_URL;
    }
  }
}
