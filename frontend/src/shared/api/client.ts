import { backendProxyBasePath } from "@/config/environment";
import { parseApiError } from "./errors";
import { tokenStorage } from "./token-storage";

export interface ApiRequestOptions extends Omit<RequestInit, "body"> {
  body?: unknown;
  auth?: boolean;
}

function buildHeaders(options: ApiRequestOptions): Headers {
  const headers = new Headers(options.headers);

  if (!(options.body instanceof FormData) && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  if (options.auth) {
    const token = tokenStorage.getAccessToken();

    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
  }

  return headers;
}

async function refreshAccessToken(): Promise<boolean> {
  const refreshToken = tokenStorage.getRefreshToken();

  if (!refreshToken) {
    return false;
  }

  const response = await fetch(`${backendProxyBasePath}/auth/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refreshToken }),
  });

  if (!response.ok) {
    tokenStorage.clear();
    return false;
  }

  const payload = (await response.json()) as { accessToken: string; refreshToken: string };
  tokenStorage.setAccessToken(payload.accessToken);
  tokenStorage.setRefreshToken(payload.refreshToken);
  return true;
}

export async function apiRequest<T>(path: string, options: ApiRequestOptions = {}): Promise<T> {
  const response = await fetch(`${backendProxyBasePath}${path}`, {
    ...options,
    headers: buildHeaders(options),
    body: options.body instanceof FormData ? options.body : options.body ? JSON.stringify(options.body) : undefined,
  });

  if (response.status === 401 && options.auth && (await refreshAccessToken())) {
    return apiRequest<T>(path, { ...options, auth: true });
  }

  if (!response.ok) {
    throw await parseApiError(response);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}
