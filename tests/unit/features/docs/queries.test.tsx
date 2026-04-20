import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor, act } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React from "react";

vi.mock("@/features/docs/api", () => ({
  listFiles: vi.fn(),
  getFile: vi.fn(),
  uploadFile: vi.fn(),
  deleteFile: vi.fn(),
}));

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
  };
}

describe("docs queries", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("useFilesQuery", () => {
    it("파일 목록을 반환한다", async () => {
      const { listFiles } = await import("@/features/docs/api");
      const mockFiles = [
        { id: "1", filename: "test.pdf", size: 1024, created_at: "2026-01-01", status: "ready" as const },
      ];
      vi.mocked(listFiles).mockResolvedValue(mockFiles);

      const { useFilesQuery } = await import("@/features/docs/queries");
      const { result } = renderHook(() => useFilesQuery(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(result.current.data).toEqual(mockFiles);
    });
  });

  describe("useFileQuery", () => {
    it("파일 상세 정보를 반환한다", async () => {
      const { getFile } = await import("@/features/docs/api");
      vi.mocked(getFile).mockResolvedValue({
        id: "1",
        filename: "test.pdf",
        size: 1024,
        created_at: "2026-01-01",
        status: "ready" as const,
      });

      const { useFileQuery } = await import("@/features/docs/queries");
      const { result } = renderHook(
        () => useFileQuery("1"),
        { wrapper: createWrapper() }
      );

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      const data = result.current.data as { id: string } | undefined;
      expect(data?.id).toBe("1");
    });

    it("enabled: false이면 쿼리를 실행하지 않는다", async () => {
      const { getFile } = await import("@/features/docs/api");

      const { useFileQuery } = await import("@/features/docs/queries");
      const { result } = renderHook(
        () => useFileQuery("1", { enabled: false }),
        { wrapper: createWrapper() }
      );

      expect(result.current.isFetching).toBe(false);
      expect(getFile).not.toHaveBeenCalled();
    });
  });

  describe("useUploadFileMutation", () => {
    it("성공 시 files 쿼리를 무효화한다", async () => {
      const { uploadFile } = await import("@/features/docs/api");
      vi.mocked(uploadFile).mockResolvedValue({
        id: "new1",
        filename: "new.pdf",
        size: 2048,
        status: "pending",
      });

      const queryClient = new QueryClient({
        defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
      });
      const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");

      const { useUploadFileMutation } = await import("@/features/docs/queries");
      const { result } = renderHook(() => useUploadFileMutation(), {
        wrapper: ({ children }) => (
          <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
        ),
      });

      await act(async () => {
        const file = new File(["content"], "new.pdf", { type: "application/pdf" });
        result.current.mutate(file);
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(invalidateSpy).toHaveBeenCalledWith(
        expect.objectContaining({ queryKey: ["files", "list"] })
      );
    });
  });

  describe("useDeleteFileMutation", () => {
    it("성공 시 files 쿼리를 무효화한다", async () => {
      const { deleteFile } = await import("@/features/docs/api");
      vi.mocked(deleteFile).mockResolvedValue(undefined);

      const queryClient = new QueryClient({
        defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
      });
      const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");

      const { useDeleteFileMutation } = await import("@/features/docs/queries");
      const { result } = renderHook(() => useDeleteFileMutation(), {
        wrapper: ({ children }) => (
          <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
        ),
      });

      await act(async () => {
        result.current.mutate("file1");
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(invalidateSpy).toHaveBeenCalledWith(
        expect.objectContaining({ queryKey: ["files", "list"] })
      );
    });
  });
});
