import { apiRequest } from "@/shared/api/client";
import { endpoints } from "@/shared/api/endpoints";
import type { AuthResponse, AuthUser } from "@/shared/types/api";
import type { LoginInput, RegisterInput } from "../types";

export function login(input: LoginInput) {
  return apiRequest<AuthResponse>(endpoints.auth.login, { method: "POST", body: input });
}

export function register(input: RegisterInput) {
  return apiRequest<AuthResponse>(endpoints.auth.register, { method: "POST", body: input });
}

export function getMe() {
  return apiRequest<AuthUser>(endpoints.auth.me, { auth: true });
}

export function logout(refreshToken: string) {
  return apiRequest<{ success: true }>(endpoints.auth.logout, { method: "POST", auth: true, body: { refreshToken } });
}
