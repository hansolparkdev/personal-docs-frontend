"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { chatKeys } from "@/lib/query-keys/chat";
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: chatKeys.sessions() });
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
