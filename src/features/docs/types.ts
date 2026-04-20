export type DocStatus = "pending" | "indexing" | "indexed" | "failed" | "unsupported";

export interface Doc {
  id: string;
  name: string;
  size: string;
  pages?: number;
  ago: string;
  status: DocStatus;
}

export interface FileListItem {
  file_id: string;
  filename: string;
  content_type: string;
  size_bytes: number;
  index_status: DocStatus;
  created_at: string;
}

export interface FileDetailResponse extends FileListItem {
  minio_path: string;
}

export interface FileUploadResponse {
  file_id: string;
  filename: string;
  index_status: DocStatus;
  created_at: string;
}

export interface FileDownloadResponse {
  download_url: string;
  expires_in: number;
}
