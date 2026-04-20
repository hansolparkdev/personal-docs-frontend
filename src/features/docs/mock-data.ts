import type { Doc } from "./types";

export const MOCK_DOCS: Doc[] = [
  {
    id: "1",
    name: "프로젝트 기획서.pdf",
    size: "2.4 MB",
    pages: 32,
    ago: "2일 전",
    status: "ready",
  },
  {
    id: "2",
    name: "API 설계 문서.pdf",
    size: "1.1 MB",
    pages: 18,
    ago: "5일 전",
    status: "ready",
  },
  {
    id: "3",
    name: "회의록 2026-04.pdf",
    size: "512 KB",
    pages: 8,
    ago: "1시간 전",
    status: "indexing",
  },
  {
    id: "4",
    name: "기술 스펙 v2.pdf",
    size: "3.7 MB",
    pages: 56,
    ago: "방금 전",
    status: "indexing",
  },
];
