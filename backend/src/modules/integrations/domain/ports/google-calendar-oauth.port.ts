export const GOOGLE_CALENDAR_OAUTH_PORT = Symbol('GOOGLE_CALENDAR_OAUTH_PORT');

export interface GoogleCalendarOAuthTokens {
  accessToken: string;
  refreshToken: string;
  tokenExpiresAt: Date;
}

export interface GoogleCalendarOAuthPort {
  getAuthUrl(state: string): string;
  exchangeCode(code: string): Promise<GoogleCalendarOAuthTokens>;
}
