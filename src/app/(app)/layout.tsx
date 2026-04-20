import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import { Sidebar } from "@/components/layout/Sidebar";
import { apiServer } from "@/lib/api-server";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("access_token");

  if (!accessToken?.value) {
    redirect("/login");
  }

  try {
    await apiServer.get("/auth/me");
  } catch (e) {
    if (isRedirectError(e)) throw e;
    redirect("/login");
  }

  return (
    <div className="flex h-screen">
      <Sidebar />
      <main className="flex-1 min-w-0 overflow-hidden flex flex-col">{children}</main>
    </div>
  );
}
