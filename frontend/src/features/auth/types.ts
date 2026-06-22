import type { AuthUser, UserRole } from "@/shared/types/api";

export type AuthStatus = "loading" | "authenticated" | "unauthenticated";

export interface AuthSession {
  user: AuthUser | null;
  status: AuthStatus;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface RegisterInput extends LoginInput {
  firstName: string;
  lastName: string;
  phone?: string;
}

export type { UserRole };
