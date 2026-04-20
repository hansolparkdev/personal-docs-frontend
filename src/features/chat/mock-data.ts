import type { Message } from "./types";

export const SEED_MESSAGES: Message[] = [
  {
    id: "1",
    role: "user",
    text: "프로젝트 기획서의 핵심 목표가 무엇인가요?",
  },
  {
    id: "2",
    role: "ai",
    text: "프로젝트 기획서에 따르면 핵심 목표는 개인 문서를 AI 기반으로 검색하고 요약하는 서비스를 구축하는 것입니다. 사용자가 업로드한 PDF 문서에 대해 자연어 질문을 통해 정보를 빠르게 찾을 수 있도록 합니다.",
    sources: [
      { doc: "프로젝트 기획서", loc: "p.3" },
      { doc: "API 설계 문서", loc: "p.1" },
    ],
  },
];
