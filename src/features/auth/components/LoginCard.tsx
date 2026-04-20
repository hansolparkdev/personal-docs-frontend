"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import type { LoginFormValues } from "../types";

export function LoginCard() {
  const router = useRouter();
  const [form, setForm] = useState<LoginFormValues>({ email: "", password: "" });

  const isFormFilled = form.email.length > 0 && form.password.length > 0;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isFormFilled) return;
    router.push("/docs");
  }

  function handleSSOLogin() {
    router.push("/docs");
  }

  return (
    <div className="w-full max-w-[400px] rounded-xl border border-border bg-card p-8 shadow-none">
      <div className="mb-6">
        <h1 className="text-xl font-semibold tracking-tight">로그인</h1>
        <p className="mt-1 text-sm text-[var(--fg-3)]">
          계정에 로그인하세요
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <label
            htmlFor="email"
            className="text-sm font-medium text-foreground"
          >
            이메일
          </label>
          <Input
            id="email"
            type="email"
            placeholder="name@example.com"
            value={form.email}
            onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
            autoComplete="email"
          />
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label
              htmlFor="password"
              className="text-sm font-medium text-foreground"
            >
              비밀번호
            </label>
            <button
              type="button"
              className="text-xs text-[var(--fg-3)] hover:text-foreground underline-offset-4 hover:underline"
            >
              비밀번호 찾기
            </button>
          </div>
          <Input
            id="password"
            type="password"
            placeholder="비밀번호를 입력하세요"
            value={form.password}
            onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))}
            autoComplete="current-password"
          />
        </div>

        <div className="flex items-center gap-2">
          <input
            id="remember"
            type="checkbox"
            className="size-4 rounded border-border"
          />
          <label htmlFor="remember" className="text-sm text-[var(--fg-2)]">
            로그인 상태 유지
          </label>
        </div>

        <Button
          type="submit"
          className="w-full"
          disabled={!isFormFilled}
        >
          로그인
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
        >
          회원가입
        </button>
      </p>
    </div>
  );
}
