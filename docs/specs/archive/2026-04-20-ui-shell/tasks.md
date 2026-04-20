# Tasks: ui-shell

## 1. 디자인 토큰 기반 작업

- [x] 1.1 globals.css 에 시맨틱 CSS 변수 추가 (fg-*, bg-*, border-*, accent-* 라이트/다크 모드)
  - 수정 파일: `src/app/globals.css`

- [x] 1.2 tailwind.config.ts 에 @theme 으로 시맨틱 토큰 등록 (text-fg-primary 등 유틸리티 사용 가능하도록)
  - 수정 파일: `tailwind.config.ts`

## 2. shared-layout — Sidebar + WordMark

- [x] 2.1 WordMark 컴포넌트 구현 (dot + 텍스트 로고)
  - 수정 파일: `src/components/layout/WordMark.tsx`

- [x] 2.2 Sidebar 컴포넌트 구현 (WordMark, "새 챗 시작" CTA, 내비게이션, 최근 대화 목록, 유저 푸터)
  - 수정 파일: `src/components/layout/Sidebar.tsx`

## 3. (app) 공통 레이아웃

- [x] 3.1 (app) layout.tsx 에 Sidebar + 콘텐츠 영역 flex 구조 적용, 목업 인증 가드(redirect 기반) 추가
  - 수정 파일: `src/app/(app)/layout.tsx`

## 4. login-page

- [x] 4.1 auth feature 타입 정의
  - 수정 파일: `src/features/auth/types.ts`

- [x] 4.2 LoginCard 컴포넌트 구현 (이메일/비밀번호 폼, "로그인" 버튼, Keycloak SSO 버튼, 목업 제출 핸들러)
  - 수정 파일: `src/features/auth/components/LoginCard.tsx`

- [x] 4.3 /login 페이지 구현 (neutral-50 배경, 중앙 카드 레이아웃)
  - 수정 파일: `src/app/(public)/login/page.tsx`

## 5. doc-upload-page

- [x] 5.1 docs feature 타입 정의 (Doc, DocStatus: 'ready' | 'indexing')
  - 수정 파일: `src/features/docs/types.ts`

- [x] 5.2 docs 목업 데이터 정의 (4개 항목, ready/indexing 혼합)
  - 수정 파일: `src/features/docs/mock-data.ts`

- [x] 5.3 Dropzone 컴포넌트 구현 (드래그 앤 드롭 UI, 목업 — 실제 업로드 없음)
  - 수정 파일: `src/features/docs/components/Dropzone.tsx`

- [x] 5.4 DocRow 컴포넌트 구현 (파일명·크기·상태 배지·삭제 버튼)
  - 수정 파일: `src/features/docs/components/DocRow.tsx`

- [x] 5.5 DocList 컴포넌트 구현 (DocRow 목록, useState 로 목업 삭제 처리)
  - 수정 파일: `src/features/docs/components/DocList.tsx`

- [x] 5.6 /docs 페이지 구현 (Dropzone + DocList 배치)
  - 수정 파일: `src/app/(app)/docs/page.tsx`

## 6. chat-page

- [x] 6.1 chat feature 타입 정의 (Message, CitationSource)
  - 수정 파일: `src/features/chat/types.ts`

- [x] 6.2 chat 목업 데이터 정의 (시드 대화 1세트: user 버블 1개 + AI 버블 1개 + 출처 2개)
  - 수정 파일: `src/features/chat/mock-data.ts`

- [x] 6.3 CitationChip 컴포넌트 구현 (문서명·페이지 칩, Badge 기반)
  - 수정 파일: `src/features/chat/components/CitationChip.tsx`

- [x] 6.4 MessageBubble 컴포넌트 구현 (role: 'user' | 'ai', AI 버블에 CitationChip 목록 포함)
  - 수정 파일: `src/features/chat/components/MessageBubble.tsx`

- [x] 6.5 MessageList 컴포넌트 구현 (버블 목록, 빈 상태 표시 포함)
  - 수정 파일: `src/features/chat/components/MessageList.tsx`

- [x] 6.6 Composer 컴포넌트 구현 (textarea + 전송 버튼, 빈 입력 시 disabled, Enter 전송)
  - 수정 파일: `src/features/chat/components/Composer.tsx`

- [x] 6.7 /chat 페이지 구현 (MessageList + Composer, useState 로 목업 응답 700ms 딜레이)
  - 수정 파일: `src/app/(app)/chat/page.tsx`

## 7. 루트 리다이렉트

- [x] 7.1 루트 page.tsx 를 /docs 로 redirect
  - 수정 파일: `src/app/page.tsx`
