"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { useLoginMutation, useRegisterMutation } from "../queries";
import { getSsoUrl } from "../api";
import type { LoginFormValues, RegisterFormValues } from "../types";

type Tab = "login" | "register";

function getLoginErrorMessage(error: (Error & { status?: number }) | null): string | null {
  if (!error) return null;
  if (error.status === 401) return "아이디 또는 비밀번호가 올바르지 않습니다.";
  return error.message || "로그인 중 오류가 발생했습니다.";
}

function getRegisterErrorMessage(error: (Error & { status?: number }) | null): string | null {
  if (!error) return null;
  if (error.status === 409) return "이미 사용 중인 아이디입니다.";
  return error.message || "회원가입 중 오류가 발생했습니다.";
}

export function LoginCard() {
  const [tab, setTab] = useState<Tab>("login");
  const [loginForm, setLoginForm] = useState<LoginFormValues>({ username: "", password: "" });
  const [registerForm, setRegisterForm] = useState<RegisterFormValues>({
    username: "",
    email: "",
    password: "",
    name: "",
  });

  const loginMutation = useLoginMutation();
  const registerMutation = useRegisterMutation();

  const isLoginFilled = loginForm.username.length > 0 && loginForm.password.length > 0;
  const isRegisterFilled =
    registerForm.username.length > 0 &&
    registerForm.email.length > 0 &&
    registerForm.password.length > 0 &&
    registerForm.name.length > 0;

  function handleLoginSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isLoginFilled) return;
    loginMutation.mutate(loginForm);
  }

  function handleRegisterSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isRegisterFilled) return;
    registerMutation.mutate(registerForm);
  }

  function handleSSOLogin() {
    const redirectUri = `${window.location.origin}/auth/callback`;
    window.location.href = getSsoUrl(redirectUri);
  }

  const loginError = getLoginErrorMessage(loginMutation.error as (Error & { status?: number }) | null);
  // isSuccess 시 에러 숨김 — 성공 후 redirect 중에 다른 쿼리 에러가 올라오는 것 방지
  const registerError = registerMutation.isSuccess
    ? null
    : getRegisterErrorMessage(registerMutation.error as (Error & { status?: number }) | null);

  return (
    <div className="w-full max-w-[400px] rounded-xl border border-border bg-card p-8 shadow-none">
      <div className="mb-6">
        <h1 className="text-xl font-semibold tracking-tight">
          {tab === "login" ? "로그인" : "회원가입"}
        </h1>
        <p className="mt-1 text-sm text-[var(--fg-3)]">
          {tab === "login" ? "계정에 로그인하세요" : "새 계정을 만드세요"}
        </p>
      </div>

      {tab === "login" ? (
        <>
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label htmlFor="username" className="text-sm font-medium text-foreground">
                아이디
              </label>
              <Input
                id="username"
                type="text"
                placeholder="아이디를 입력하세요"
                value={loginForm.username}
                onChange={(e) => setLoginForm((prev) => ({ ...prev, username: e.target.value }))}
                autoComplete="username"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="password" className="text-sm font-medium text-foreground">
                비밀번호
              </label>
              <Input
                id="password"
                type="password"
                placeholder="비밀번호를 입력하세요"
                value={loginForm.password}
                onChange={(e) => setLoginForm((prev) => ({ ...prev, password: e.target.value }))}
                autoComplete="current-password"
              />
            </div>

            {loginError && (
              <p className="text-sm text-destructive">{loginError}</p>
            )}

            <Button
              type="submit"
              className="w-full"
              disabled={!isLoginFilled || loginMutation.isPending}
            >
              {loginMutation.isPending ? "로그인 중..." : "로그인"}
            </Button>
          </form>

          <div className="my-4 flex items-center gap-3">
            <Separator className="flex-1" />
            <span className="text-xs text-[var(--fg-3)]">또는</span>
            <Separator className="flex-1" />
          </div>

          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={handleSSOLogin}
          >
            SSO로 로그인
          </Button>

          <p className="mt-4 text-center text-sm text-[var(--fg-3)]">
            계정이 없으신가요?{" "}
            <button
              type="button"
              className="font-medium text-foreground underline-offset-4 hover:underline"
              onClick={() => setTab("register")}
            >
              회원가입
            </button>
          </p>
        </>
      ) : (
        <>
          <form onSubmit={handleRegisterSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label htmlFor="reg-username" className="text-sm font-medium text-foreground">
                아이디
              </label>
              <Input
                id="reg-username"
                type="text"
                placeholder="아이디를 입력하세요"
                value={registerForm.username}
                onChange={(e) =>
                  setRegisterForm((prev) => ({ ...prev, username: e.target.value }))
                }
                autoComplete="username"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="reg-email" className="text-sm font-medium text-foreground">
                이메일
              </label>
              <Input
                id="reg-email"
                type="email"
                placeholder="name@example.com"
                value={registerForm.email}
                onChange={(e) =>
                  setRegisterForm((prev) => ({ ...prev, email: e.target.value }))
                }
                autoComplete="email"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="reg-password" className="text-sm font-medium text-foreground">
                비밀번호
              </label>
              <Input
                id="reg-password"
                type="password"
                placeholder="비밀번호를 입력하세요"
                value={registerForm.password}
                onChange={(e) =>
                  setRegisterForm((prev) => ({ ...prev, password: e.target.value }))
                }
                autoComplete="new-password"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="reg-name" className="text-sm font-medium text-foreground">
                이름
              </label>
              <Input
                id="reg-name"
                type="text"
                placeholder="이름을 입력하세요"
                value={registerForm.name}
                onChange={(e) =>
                  setRegisterForm((prev) => ({ ...prev, name: e.target.value }))
                }
                autoComplete="name"
              />
            </div>

            {registerError && (
              <p className="text-sm text-destructive">{registerError}</p>
            )}

            <Button
              type="submit"
              className="w-full"
              disabled={!isRegisterFilled || registerMutation.isPending}
            >
              {registerMutation.isPending ? "가입 중..." : "회원가입 완료"}
            </Button>
          </form>

          <p className="mt-4 text-center text-sm text-[var(--fg-3)]">
            이미 계정이 있으신가요?{" "}
            <button
              type="button"
              className="font-medium text-foreground underline-offset-4 hover:underline"
              onClick={() => setTab("login")}
            >
              로그인
            </button>
          </p>
        </>
      )}
    </div>
  );
}
