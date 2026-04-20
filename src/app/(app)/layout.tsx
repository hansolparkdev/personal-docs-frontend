import { redirect } from "next/navigation";
import { Sidebar } from "@/components/layout/Sidebar";

const MOCK_RECENT_CHATS = [
  { id: "1", title: "프로젝트 문서 요약 질문" },
  { id: "2", title: "Next.js 배포 관련 문의" },
  { id: "3", title: "React 상태 관리 비교" },
];

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const isAuthenticated = true;

  if (!isAuthenticated) {
    redirect("/login");
  }

  return (
    <div className="flex h-screen">
      <Sidebar recentChats={MOCK_RECENT_CHATS} />
      <main className="flex-1 min-w-0 overflow-hidden flex flex-col">{children}</main>
    </div>
  );
}
