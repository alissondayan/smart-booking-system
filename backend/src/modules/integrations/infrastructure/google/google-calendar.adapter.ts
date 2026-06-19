import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { google } from 'googleapis';
import {
  CALENDAR_INTEGRATION_REPOSITORY,
  CalendarIntegrationRepositoryPort,
} from '../../domain/ports/calendar-integration.repository.port';
import {
  CalendarAppointment,
  CalendarPort,
} from '../../domain/ports/calendar.port';
import {
  GoogleCalendarOAuthPort,
  GoogleCalendarOAuthTokens,
} from '../../domain/ports/google-calendar-oauth.port';

@Injectable()
export class GoogleCalendarAdapter implements CalendarPort, GoogleCalendarOAuthPort {
  constructor(
    private readonly configService: ConfigService,
    @Inject(CALENDAR_INTEGRATION_REPOSITORY)
    private readonly integrationRepository: CalendarIntegrationRepositoryPort,
  ) {}

  getAuthUrl(): string {
    return this.createOAuthClient().generateAuthUrl({
      access_type: 'offline',
      prompt: 'consent',
      scope: ['https://www.googleapis.com/auth/calendar.events'],
    });
  }

  async exchangeCode(code: string): Promise<GoogleCalendarOAuthTokens> {
    const client = this.createOAuthClient();
    const { tokens } = await client.getToken(code);

    if (!tokens.access_token || !tokens.refresh_token) {
      throw new Error('Google OAuth did not return required tokens');
    }

    return {
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token,
      tokenExpiresAt: new Date(tokens.expiry_date ?? Date.now() + 3600_000),
    };
  }

  async createEvent(appointment: CalendarAppointment): Promise<string> {
    const { calendar, calendarId } = await this.createCalendarClient();
    const response = await calendar.events.insert({
      calendarId,
      requestBody: this.toEvent(appointment),
    });

    if (!response.data.id) {
      throw new Error('Google Calendar did not return event id');
    }

    return response.data.id;
  }

  async updateEvent(
    eventId: string,
    appointment: CalendarAppointment,
  ): Promise<void> {
    const { calendar, calendarId } = await this.createCalendarClient();
    await calendar.events.update({
      calendarId,
      eventId,
      requestBody: this.toEvent(appointment),
    });
  }

  async deleteEvent(eventId: string): Promise<void> {
    const { calendar, calendarId } = await this.createCalendarClient();
    await calendar.events.delete({ calendarId, eventId });
  }

  private async createCalendarClient() {
    const integration = await this.integrationRepository.findGoogle();

    if (!integration) {
      throw new Error('Google Calendar is not connected');
    }

    const auth = this.createOAuthClient();
    auth.setCredentials({
      access_token: integration.accessToken,
      refresh_token: integration.refreshToken,
      expiry_date: integration.tokenExpiresAt.getTime(),
    });

    return {
      calendar: google.calendar({ version: 'v3', auth }),
      calendarId: integration.calendarId ?? 'primary',
    };
  }

  private createOAuthClient() {
    return new google.auth.OAuth2(
      this.configService.get<string>('GOOGLE_CLIENT_ID') ?? '',
      this.configService.get<string>('GOOGLE_CLIENT_SECRET') ?? '',
      this.configService.get<string>('GOOGLE_CALLBACK_URL') ??
        'http://localhost:3000/api/v1/admin/integrations/calendar/google/callback',
    );
  }

  private toEvent(appointment: CalendarAppointment) {
    return {
      summary: appointment.serviceName,
      description: `Smart Booking appointment at ${appointment.businessName}`,
      start: { dateTime: appointment.startAt.toISOString() },
      end: { dateTime: appointment.endAt.toISOString() },
    };
  }
}
