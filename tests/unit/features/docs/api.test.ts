import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/api", () => ({
  api: {
    get: vi.fn(),
    post: vi.fn(),
    delete: vi.fn(),
  },
}));

describe("docs/api", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("uploadFile: POST /files로 FormData를 전송한다", async () => {
    const { api } = await import("@/lib/api");
    vi.mocked(api.post).mockResolvedValue({
      id: "file1",
      filename: "test.pdf",
      size: 1024,
      status: "pending",
    });

    const { uploadFile } = await import("@/features/docs/api");
    const file = new File(["content"], "test.pdf", { type: "application/pdf" });
    await uploadFile(file);

    expect(api.post).toHaveBeenCalledWith(
      "/files",
      expect.any(FormData),
      expect.objectContaining({
        headers: {},
      })
    );
  });

  it("listFiles: GET /files로 요청한다", async () => {
    const { api } = await import("@/lib/api");
    vi.mocked(api.get).mockResolvedValue([]);

    const { listFiles } = await import("@/features/docs/api");
    await listFiles();

    expect(api.get).toHaveBeenCalledWith("/files");
  });

  it("getFile: GET /files/{id}로 요청한다", async () => {
    const { api } = await import("@/lib/api");
    vi.mocked(api.get).mockResolvedValue({ id: "file1", filename: "test.pdf" });

    const { getFile } = await import("@/features/docs/api");
    await getFile("file1");

    expect(api.get).toHaveBeenCalledWith("/files/file1");
  });

  it("deleteFile: DELETE /files/{id}로 요청한다", async () => {
    const { api } = await import("@/lib/api");
    vi.mocked(api.delete).mockResolvedValue(undefined);

    const { deleteFile } = await import("@/features/docs/api");
    await deleteFile("file1");

    expect(api.delete).toHaveBeenCalledWith("/files/file1");
  });

  it("getDownloadUrl: GET /files/{id}/download로 요청한다", async () => {
    const { api } = await import("@/lib/api");
    vi.mocked(api.get).mockResolvedValue({ download_url: "https://presigned.url" });

    const { getDownloadUrl } = await import("@/features/docs/api");
    await getDownloadUrl("file1");

    expect(api.get).toHaveBeenCalledWith("/files/file1/download");
  });
});
