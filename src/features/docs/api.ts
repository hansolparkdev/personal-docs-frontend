import { api } from "@/lib/api";
import type {
  FileDetailResponse,
  FileDownloadResponse,
  FileListItem,
  FileUploadResponse,
} from "./types";

export async function uploadFile(file: File): Promise<FileUploadResponse> {
  const formData = new FormData();
  formData.append("file", file);
  return api.post<FileUploadResponse>("/files", formData, { headers: {} });
}

export async function listFiles(): Promise<FileListItem[]> {
  return api.get<FileListItem[]>("/files");
}

export async function getFile(fileId: string): Promise<FileDetailResponse> {
  return api.get<FileDetailResponse>(`/files/${fileId}`);
}

export async function deleteFile(fileId: string): Promise<void> {
  return api.delete<void>(`/files/${fileId}`);
}

export async function getDownloadUrl(fileId: string): Promise<FileDownloadResponse> {
  return api.get<FileDownloadResponse>(`/files/${fileId}/download`);
}
