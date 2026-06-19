import { UserRole } from '../../../../shared/domain/enums/user-role.enum';

export const TOKEN_SERVICE = Symbol('TOKEN_SERVICE');

export interface AuthTokenPayload {
  sub: string;
  email: string;
  role: UserRole;
}

export interface IssuedTokens {
  accessToken: string;
  refreshToken: string;
  refreshTokenHash: string;
  refreshTokenExpiresAt: Date;
}

export interface TokenServicePort {
  issueTokens(payload: AuthTokenPayload): Promise<IssuedTokens>;
  hashRefreshToken(refreshToken: string): Promise<string>;
}
