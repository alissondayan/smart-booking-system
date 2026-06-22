import { useMutation } from "@tanstack/react-query";
import { login, register } from "../api/auth.api";
import type { LoginInput, RegisterInput } from "../types";
import { useAuth } from "./use-auth";

export function useLogin() {
  const auth = useAuth();

  return useMutation({
    mutationFn: (input: LoginInput) => login(input),
    onSuccess: (response) => {
      auth.setAuthenticatedSession(response);
    },
  });
}

export function useRegister() {
  const auth = useAuth();

  return useMutation({
    mutationFn: (input: RegisterInput) => register(input),
    onSuccess: (response) => {
      auth.setAuthenticatedSession(response);
    },
  });
}
