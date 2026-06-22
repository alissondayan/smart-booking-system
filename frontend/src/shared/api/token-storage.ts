import { readBrowserStorage, writeBrowserStorage } from "@/shared/lib/storage";

export interface TokenStorage {
  getAccessToken(): string | null;
  setAccessToken(token: string | null): void;
  getRefreshToken(): string | null;
  setRefreshToken(token: string | null): void;
  clear(): void;
}

const accessTokenKey = "smartBooking.accessToken";
const refreshTokenKey = "smartBooking.refreshToken";
let memoryAccessToken: string | null = null;

export const browserTokenStorage: TokenStorage = {
  getAccessToken() {
    return memoryAccessToken ?? readBrowserStorage(accessTokenKey);
  },
  setAccessToken(token) {
    memoryAccessToken = token;
    writeBrowserStorage(accessTokenKey, token);
  },
  getRefreshToken() {
    return readBrowserStorage(refreshTokenKey);
  },
  setRefreshToken(token) {
    writeBrowserStorage(refreshTokenKey, token);
  },
  clear() {
    memoryAccessToken = null;
    writeBrowserStorage(accessTokenKey, null);
    writeBrowserStorage(refreshTokenKey, null);
  },
};

export const tokenStorage = browserTokenStorage;
