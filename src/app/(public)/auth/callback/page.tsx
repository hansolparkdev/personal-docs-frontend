import { redirect } from "next/navigation";
import { apiServer } from "@/lib/api-server";

interface CallbackPageProps {
  searchParams: Promise<{ code?: string }>;
}

export default async function CallbackPage({ searchParams }: CallbackPageProps) {
  const params = await searchParams;
  const code = params.code;

  if (!code) {
    redirect("/login?error=sso");
  }

  try {
    const redirectUri = `${process.env.NEXT_PUBLIC_BASE_URL ?? ""}/auth/callback`;
    const callbackParams = new URLSearchParams({ code, redirect_uri: redirectUri });
    await apiServer.get(`/auth/callback?${callbackParams.toString()}`);
    redirect("/docs");
  } catch {
    redirect("/login?error=sso");
  }
}
