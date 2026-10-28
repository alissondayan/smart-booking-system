import { Inject, Injectable, Logger } from '@nestjs/common';
import {
  CALENDAR_INTEGRATION_REPOSITORY,
  CalendarIntegrationRepositoryPort,
} from '../domain/ports/calendar-integration.repository.port';
import {
  GOOGLE_CALENDAR_OAUTH_PORT,
  GoogleCalendarOAuthPort,
} from '../domain/ports/google-calendar-oauth.port';
import { GoogleOAuthStateService } from '../infrastructure/google/google-oauth-state.service';

export type GoogleCalendarCallbackReason =
  | 'access_denied'
  | 'invalid_state'
  | 'connection_failed';

export type GoogleCalendarCallbackResult =
  | { status: 'connected' }
  | { status: 'error'; reason: GoogleCalendarCallbackReason };

export interface GoogleCalendarCallbackParams {
  code?: string;
  state?: string;
  error?: string;
}

@Injectable()
export class ConnectGoogleCalendarUseCase {
  private readonly logger = new Logger(ConnectGoogleCalendarUseCase.name);

  constructor(
    @Inject(GOOGLE_CALENDAR_OAUTH_PORT)
    private readonly googleOAuth: GoogleCalendarOAuthPort,
    @Inject(CALENDAR_INTEGRATION_REPOSITORY)
    private readonly integrationRepository: CalendarIntegrationRepositoryPort,
    private readonly stateService: GoogleOAuthStateService,
  ) {}

  getAuthUrl(userId: string): { authUrl: string } {
    const state = this.stateService.issue(userId);

    return { authUrl: this.googleOAuth.getAuthUrl(state) };
  }

  async handleCallback(
    params: GoogleCalendarCallbackParams,
  ): Promise<GoogleCalendarCallbackResult> {
    if (params.error) {
      return {
        status: 'error',
        reason:
          params.error === 'access_denied' ? 'access_denied' : 'connection_failed',
      };
    }

    if (!this.stateService.verify(params.state)) {
      this.logger.warn('Rejected Google Calendar callback with invalid state');

      return { status: 'error', reason: 'invalid_state' };
    }

    if (!params.code) {
      return { status: 'error', reason: 'connection_failed' };
    }

    try {
      const tokens = await this.googleOAuth.exchangeCode(params.code);
      await this.integrationRepository.saveGoogle({
        ...tokens,
        calendarId: 'primary',
      });
    } catch {
      // The thrown error can carry the authorization code, so it is not logged.
      this.logger.error('Google Calendar token exchange failed');

      return { status: 'error', reason: 'connection_failed' };
    }

    return { status: 'connected' };
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
