"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { fileKeys } from "@/lib/query-keys/files";
import { deleteFile, getFile, listFiles, uploadFile } from "./api";
import type { DocStatus } from "./types";

const PROCESSING_STATUSES: DocStatus[] = ["pending", "indexing"];

export function useFilesQuery() {
  return useQuery({
    queryKey: fileKeys.list(),
    queryFn: listFiles,
    refetchInterval: (query) => {
      const files = query.state.data;
      if (!files) return false;
      const hasProcessing = files.some((f) =>
        PROCESSING_STATUSES.includes(f.index_status)
      );
      return hasProcessing ? 3000 : false;
    },
  });
}

interface UseFileQueryOptions {
  enabled?: boolean;
  refetchInterval?: number | false;
}

export function useFileQuery(fileId: string, options?: UseFileQueryOptions) {
  return useQuery({
    queryKey: fileKeys.detail(fileId),
    queryFn: () => getFile(fileId),
    enabled: options?.enabled ?? true,
    refetchInterval: options?.refetchInterval,
  });
}

export function useUploadFileMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: uploadFile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: fileKeys.list() });
    },
  });
}

export function useDeleteFileMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteFile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: fileKeys.list() });
    },
  });
}
