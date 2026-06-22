import type { ApiErrorEnvelope } from "@/shared/types/api";

export class ApiError extends Error {
  constructor(
    message: string,
    readonly statusCode: number,
    readonly code?: string,
    readonly details?: unknown,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export function isApiErrorEnvelope(value: unknown): value is ApiErrorEnvelope {
  if (!value || typeof value !== "object") {
    return false;
  }

  const maybeEnvelope = value as Partial<ApiErrorEnvelope>;
  return typeof maybeEnvelope.statusCode === "number" && typeof maybeEnvelope.error?.message === "string";
}

export async function parseApiError(response: Response): Promise<ApiError> {
  let payload: unknown;

  try {
    payload = await response.json();
  } catch {
    payload = undefined;
  }

  if (isApiErrorEnvelope(payload)) {
    return new ApiError(payload.error.message, payload.statusCode, payload.error.code, payload.error.details);
  }

  return new ApiError(response.statusText || "Request failed", response.status);
}
