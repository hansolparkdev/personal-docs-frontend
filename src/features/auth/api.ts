import { api } from "@/lib/api";
import type { LoginFormValues, RegisterFormValues, TokenResponse, UserResponse } from "./types";

export async function login(username: string, password: string): Promise<void> {
  await api.post<{ ok: boolean }>("/auth/login", { username, password });
}

export async function register(body: RegisterFormValues): Promise<UserResponse> {
  return api.post<UserResponse>("/auth/register", body);
}

export async function logout(): Promise<void> {
  return api.post<void>("/auth/logout", {});
}

export async function refreshToken(): Promise<TokenResponse> {
  return api.post<TokenResponse>("/auth/refresh", {});
}

export async function getMe(): Promise<UserResponse> {
  return api.get<UserResponse>("/auth/me");
}

export function getSsoUrl(redirectUri: string): string {
  return `/api/auth/sso?redirect_uri=${encodeURIComponent(redirectUri)}`;
}

export async function exchangeCode(code: string, redirectUri: string): Promise<TokenResponse> {
  const params = new URLSearchParams({ code, redirect_uri: redirectUri });
  return api.get<TokenResponse>(`/auth/callback?${params.toString()}`);
}
