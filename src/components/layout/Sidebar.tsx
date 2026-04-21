"use client";

import { usePathname, useRouter } from "next/navigation";
import { FileText, LogOut, PenSquare, X } from "lucide-react";
import { WordMark } from "./WordMark";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { useMeQuery, useLogoutMutation } from "@/features/auth/queries";
import { useSessionsQuery, useCreateSessionMutation, useDeleteSessionMutation } from "@/features/chat/queries";

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { data: user, isLoading } = useMeQuery();
  const logoutMutation = useLogoutMutation();
  const { data: sessions } = useSessionsQuery();
  const createSessionMutation = useCreateSessionMutation();
  const deleteSessionMutation = useDeleteSessionMutation();

  const isDocsActive = pathname === "/docs" || pathname.startsWith("/docs/");
  const isChatActive = pathname === "/chat" || pathname.startsWith("/chat/");

  const avatarInitial = user?.name ? user.name.charAt(0) : user?.username?.charAt(0) ?? "?";

  async function handleNewChat() {
    const session = await createSessionMutation.mutateAsync();
    window.location.href = `/chat?session=${session.id}`;
  }

  return (
    <aside className="w-[260px] shrink-0 flex flex-col h-screen bg-[var(--sidebar)] border-r border-[var(--sidebar-border)]">
      {/* 상단: WordMark */}
      <div className="px-4 py-4">
        <WordMark size="sm" />
      </div>

      {/* 새 챗 시작 버튼 */}
      <div className="px-3 pb-2">
        <Button
          variant="default"
          className="w-full justify-start gap-2 rounded-lg"
          onClick={handleNewChat}
          disabled={createSessionMutation.isPending}
        >
          <PenSquare className="size-4" />
          새 챗 시작
        </Button>
      </div>

      {/* 내비게이션 */}
      <nav className="px-3 pb-2 space-y-1 border-b border-[var(--sidebar-border)]">
        <button
          type="button"
          onClick={() => router.push("/docs")}
          className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
            isDocsActive
              ? "bg-accent text-accent-foreground"
              : "text-[var(--fg-2)] hover:bg-muted hover:text-foreground"
          }`}
        >
          <FileText className="size-4 shrink-0" />
          내 문서
        </button>
      </nav>

      {/* 최근 대화 섹션 */}
      <div className="flex-1 overflow-auto min-h-0 py-3">
        <p className="text-xs font-semibold text-[var(--fg-3)] uppercase tracking-wider px-4 mb-2">
          최근 대화
        </p>
        {!sessions || sessions.length === 0 ? (
          <p className="text-xs text-[var(--fg-3)] px-4 py-1">
            아직 대화 기록이 없어요
          </p>
        ) : (
          <ul className="space-y-0.5 px-2">
            {sessions.map((session) => (
              <li key={session.id} className="group flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => router.push(`/chat?session=${session.id}`)}
                  className="flex-1 min-w-0 text-left text-sm text-[var(--fg-2)] hover:bg-muted hover:text-foreground px-2 py-1.5 rounded-lg truncate transition-colors cursor-pointer"
                >
                  {session.title ?? "새 대화"}
                </button>
                <button
                  type="button"
                  onClick={() => deleteSessionMutation.mutate(session.id)}
                  disabled={deleteSessionMutation.isPending}
                  aria-label="대화 삭제"
                  className="opacity-0 group-hover:opacity-100 shrink-0 p-1 rounded-md text-[var(--fg-3)] hover:text-foreground hover:bg-muted transition-all cursor-pointer"
                >
                  <X className="size-3.5" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* 유저 푸터 */}
      <div className="px-3 py-3 border-t border-[var(--sidebar-border)] flex items-center gap-2">
        {isLoading ? (
          <div className="flex items-center gap-2 flex-1 animate-pulse">
            <Skeleton className="size-7 rounded-full" />
            <div className="flex-1 space-y-1">
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-2 w-24" />
            </div>
          </div>
        ) : user ? (
          <>
            <Avatar size="sm">
              <AvatarFallback>{avatarInitial}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user.name ?? user.username}</p>
              <p className="text-xs text-[var(--fg-3)] truncate">{user.email}</p>
            </div>
          </>
        ) : (
          <div className="flex-1 min-w-0">
            <p className="text-sm text-[var(--fg-3)]">사용자 정보를 불러올 수 없습니다</p>
          </div>
        )}
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => logoutMutation.mutate()}
          aria-label="로그아웃"
        >
          <LogOut className="size-4" />
        </Button>
      </div>
    </aside>
  );
}
