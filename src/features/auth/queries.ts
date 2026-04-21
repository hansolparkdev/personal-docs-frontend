"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { authKeys } from "@/lib/query-keys/auth";
import { getMe, login, logout, register } from "./api";
import type { LoginFormValues, RegisterFormValues } from "./types";

export function useMeQuery() {
  return useQuery({
    queryKey: authKeys.me(),
    queryFn: getMe,
    retry: false,
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
      // Keycloak이 유저를 준비하는 시간 확보
      await new Promise((r) => setTimeout(r, 500));
      await login(body.username, body.password);
      return user;
    },
    onSuccess: () => {
      toast.success("회원가입이 완료됐어요. 환영해요!");
      window.location.href = "/docs";
    },
    onError: () => {
      // 에러는 LoginCard에서 처리
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
