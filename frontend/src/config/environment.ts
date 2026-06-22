export const environment = {
  apiBaseUrl: process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3000/api/v1",
  appUrl: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3001",
  authTokenStorage: process.env.NEXT_PUBLIC_AUTH_TOKEN_STORAGE ?? "browser",
} as const;

export const backendProxyBasePath = "/api/backend";
