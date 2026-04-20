"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { authKeys } from "@/lib/query-keys/auth";
import { getMe, login, logout, register } from "./api";
import type { LoginFormValues, RegisterFormValues } from "./types";

export function useMeQuery() {
  return useQuery({
    queryKey: authKeys.me(),
    queryFn: getMe,
  });
}

export function useLoginMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ username, password }: LoginFormValues) =>
      login(username, password),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: authKeys.me() });
      // hard navigation — Server Component가 새 HttpOnly 쿠키를 읽도록
      window.location.href = "/docs";
    },
  });
}

export function useRegisterMutation() {
  return useMutation({
    mutationFn: async (body: RegisterFormValues) => {
      const user = await register(body);
      await login(body.username, body.password);
      return user;
    },
    onSuccess: () => {
      window.location.href = "/docs";
    },
  });
}

export function useLogoutMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: logout,
    onSuccess: () => {
      queryClient.resetQueries({ queryKey: authKeys.me() });
      window.location.href = "/login";
    },
  });
}
