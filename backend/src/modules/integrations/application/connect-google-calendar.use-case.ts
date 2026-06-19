import { Inject, Injectable } from '@nestjs/common';
import {
  CALENDAR_INTEGRATION_REPOSITORY,
  CalendarIntegrationRepositoryPort,
} from '../domain/ports/calendar-integration.repository.port';
import {
  GOOGLE_CALENDAR_OAUTH_PORT,
  GoogleCalendarOAuthPort,
} from '../domain/ports/google-calendar-oauth.port';

@Injectable()
export class ConnectGoogleCalendarUseCase {
  constructor(
    @Inject(GOOGLE_CALENDAR_OAUTH_PORT)
    private readonly googleOAuth: GoogleCalendarOAuthPort,
    @Inject(CALENDAR_INTEGRATION_REPOSITORY)
    private readonly integrationRepository: CalendarIntegrationRepositoryPort,
  ) {}

  getAuthUrl(): { authUrl: string } {
    return { authUrl: this.googleOAuth.getAuthUrl() };
  }

  async connect(code: string): Promise<{ connected: true }> {
    const tokens = await this.googleOAuth.exchangeCode(code);
    await this.integrationRepository.saveGoogle({
      ...tokens,
      calendarId: 'primary',
    });

    return { connected: true };
  }

  async status(): Promise<{ connected: boolean; calendarId?: string | null }> {
    const integration = await this.integrationRepository.findGoogle();

    return {
      connected: Boolean(integration),
      calendarId: integration?.calendarId,
    };
  }

  async disconnect(): Promise<{ connected: false }> {
    await this.integrationRepository.deleteGoogle();

    return { connected: false };
  }
}
