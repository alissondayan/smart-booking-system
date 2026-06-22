"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { getMe } from "@/features/auth/api/auth.api";
import type { AuthSession } from "@/features/auth/types";
import type { AuthResponse, AuthUser } from "@/shared/types/api";
import { clearSessionTokens, hasStoredSession, persistAuthResponse } from "@/features/auth/services/session.service";

interface AuthContextValue extends AuthSession {
  setAuthenticatedSession(response: AuthResponse): void;
  setUser(user: AuthUser | null): void;
  clearSession(): void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUserState] = useState<AuthUser | null>(null);
  const [status, setStatus] = useState<AuthSession["status"]>("loading");

  useEffect(() => {
    let isMounted = true;

    async function restoreSession() {
      if (!hasStoredSession()) {
        if (isMounted) {
          setStatus("unauthenticated");
        }

        return;
      }

      try {
        const currentUser = await getMe();

        if (isMounted) {
          setUserState(currentUser);
          setStatus("authenticated");
        }
      } catch {
        clearSessionTokens();

        if (isMounted) {
          setUserState(null);
          setStatus("unauthenticated");
        }
      }
    }

    void restoreSession();

    return () => {
      isMounted = false;
    };
  }, []);

  const setAuthenticatedSession = useCallback((response: AuthResponse) => {
    persistAuthResponse(response);
    setUserState(response.user);
    setStatus("authenticated");
  }, []);

  const setUser = useCallback((nextUser: AuthUser | null) => {
    setUserState(nextUser);
    setStatus(nextUser ? "authenticated" : "unauthenticated");
  }, []);

  const clearSession = useCallback(() => {
    clearSessionTokens();
    setUserState(null);
    setStatus("unauthenticated");
  }, []);

  const value = useMemo(
    () => ({ user, status, setAuthenticatedSession, setUser, clearSession }),
    [clearSession, setAuthenticatedSession, setUser, status, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return context;
}
