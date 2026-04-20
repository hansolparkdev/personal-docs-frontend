import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import { LoginCard } from "@/features/auth/components/LoginCard";
import { apiServer } from "@/lib/api-server";

export default async function LoginPage() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("access_token");

  if (accessToken?.value) {
    try {
      await apiServer.get("/auth/me");
      redirect("/docs");
    } catch (e) {
      if (isRedirectError(e)) throw e; // redirect는 반드시 재throw
      // 토큰 만료 — 로그인 화면 그대로 표시
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg-2)]">
      <LoginCard />
    </div>
  );
}
