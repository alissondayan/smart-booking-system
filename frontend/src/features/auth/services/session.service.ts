import type { AuthResponse } from "@/shared/types/api";
import { tokenStorage } from "@/shared/api/token-storage";

export function persistAuthResponse(response: AuthResponse): void {
  tokenStorage.setAccessToken(response.accessToken);
  tokenStorage.setRefreshToken(response.refreshToken);
}

export function clearSessionTokens(): void {
  tokenStorage.clear();
}

export function hasStoredSession(): boolean {
  return Boolean(tokenStorage.getAccessToken() || tokenStorage.getRefreshToken());
}
