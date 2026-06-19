export const CALENDAR_INTEGRATION_REPOSITORY = Symbol(
  'CALENDAR_INTEGRATION_REPOSITORY',
);

export interface CalendarIntegrationRecord {
  id: string;
  provider: 'GOOGLE';
  accessToken: string;
  refreshToken: string;
  tokenExpiresAt: Date;
  calendarId?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface SaveGoogleCalendarIntegrationData {
  accessToken: string;
  refreshToken: string;
  tokenExpiresAt: Date;
  calendarId?: string | null;
}

export interface CalendarIntegrationRepositoryPort {
  findGoogle(): Promise<CalendarIntegrationRecord | null>;
  saveGoogle(data: SaveGoogleCalendarIntegrationData): Promise<CalendarIntegrationRecord>;
  deleteGoogle(): Promise<void>;
}
