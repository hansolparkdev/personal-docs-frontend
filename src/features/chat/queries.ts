"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { chatKeys } from "@/lib/query-keys/chat";
import type { ChatSession } from "./types";
import {
  createSession,
  deleteSession,
  getSession,
  listSessions,
} from "./api";

export function useSessionsQuery() {
  return useQuery({
    queryKey: chatKeys.sessions(),
    queryFn: listSessions,
  });
}

export function useSessionQuery(sessionId: string | null) {
  return useQuery({
    queryKey: chatKeys.session(sessionId),
    queryFn: () => getSession(sessionId!),
    enabled: !!sessionId,
  });
}

export function useCreateSessionMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createSession,
    onSuccess: (newSession) => {
      // 캐시에 즉시 추가 → 빈 상태 깜빡임 방지
      queryClient.setQueryData<ChatSession[]>(chatKeys.sessions(), (prev) =>
        prev ? [newSession, ...prev] : [newSession]
      );
    },
  });
}

export function useDeleteSessionMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (sessionId: string) => deleteSession(sessionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: chatKeys.sessions() });
    },
  });
}
