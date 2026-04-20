## MODIFIED Requirements

기존 `doc-upload-page` capability에 영향을 미치는 파일 관리 연동 요구사항.

---

### Requirement: 파일 업로드 — 실제 API 연동

사용자가 Dropzone에 파일을 드롭하거나 선택하면 BFF를 통해 `POST /api/v1/files`(multipart/form-data)로 실제 업로드를 수행한다. 업로드 성공 시 파일 목록이 자동으로 갱신된다.

#### Scenario: 파일 업로드 성공

- **Given** 사용자가 `/docs` 페이지에 있고 지원 확장자의 50MB 이하 파일을 준비했다
- **When** 파일을 Dropzone에 드롭하거나 파일 선택 대화상자로 선택한다
- **Then** BFF를 통해 `POST /files`(multipart/form-data)가 호출된다
- **And** 업로드 중 Dropzone에 로딩 인디케이터가 표시된다
- **And** 성공 응답 수신 후 파일 목록 쿼리 캐시가 무효화되어 목록이 갱신된다

#### Scenario: 파일 업로드 — 지원 확장자 외 파일

- **Given** 사용자가 지원하지 않는 확장자(예: `.exe`, `.zip`)의 파일을 준비했다
- **When** 파일을 Dropzone에 드롭한다
- **Then** 업로드 요청이 발생하지 않는다
- **And** "지원하지 않는 파일 형식입니다." 에러 메시지가 표시된다

#### Scenario: 파일 업로드 — 50MB 초과 파일

- **Given** 사용자가 50MB를 초과하는 파일을 준비했다
- **When** 파일을 Dropzone에 드롭한다
- **Then** 업로드 요청이 발생하지 않는다
- **And** "파일 크기는 50MB를 초과할 수 없습니다." 에러 메시지가 표시된다

---

### Requirement: 파일 목록 조회 — TanStack Query

`DocList`의 `useState` 목업 배열을 제거하고 `GET /api/v1/files`로 실제 파일 목록을 조회한다. `useQuery`를 사용하며 로딩·에러·빈 상태를 처리한다.

#### Scenario: 파일 목록 정상 조회

- **Given** 사용자가 인증된 상태로 `/docs` 페이지에 접근했다
- **When** 페이지가 렌더링된다
- **Then** `GET /files`가 호출되고 실제 파일 목록이 표시된다

#### Scenario: 파일 목록 — 로딩 상태

- **Given** `GET /files` 요청이 진행 중이다
- **When** DocList가 렌더링된다
- **Then** 스켈레톤 또는 로딩 인디케이터가 표시된다

#### Scenario: 파일 목록 — 빈 상태

- **Given** 사용자가 업로드한 파일이 없다
- **When** `GET /files`가 빈 배열을 반환한다
- **Then** "업로드된 문서가 없습니다." 안내 메시지가 표시된다

#### Scenario: 파일 목록 — 에러 상태

- **Given** `GET /files` 요청이 실패했다
- **When** DocList가 에러 상태로 전환된다
- **Then** 에러 메시지와 재시도 버튼이 표시된다

---

### Requirement: 파일 삭제 — 실제 API 연동

사용자가 파일 삭제 버튼을 클릭하면 `DELETE /api/v1/files/{file_id}`를 호출하고, 성공 시 목록에서 해당 파일이 제거된다.

#### Scenario: 파일 삭제 성공

- **Given** 사용자가 `/docs` 페이지에서 특정 파일의 삭제 버튼을 클릭했다
- **When** BFF를 통해 `DELETE /files/{file_id}`가 호출된다
- **Then** 204 응답 후 파일 목록 쿼리 캐시가 무효화된다
- **And** 해당 파일이 목록에서 사라진다

#### Scenario: 파일 삭제 실패

- **Given** 삭제 요청 중 네트워크 오류 또는 서버 에러가 발생했다
- **When** `DELETE /files/{file_id}`가 에러를 반환한다
- **Then** "파일 삭제에 실패했습니다." 에러 메시지가 표시된다
- **And** 목록은 변경되지 않는다

---

### Requirement: 파일 indexing 상태 Polling

업로드 후 status가 `pending` 또는 `indexing`인 파일에 대해 `GET /api/v1/files/{file_id}`를 3초 간격으로 polling하여 status 변화를 감지하고 배지를 업데이트한다.

#### Scenario: 업로드 후 indexing → ready 전환

- **Given** 사용자가 파일을 업로드했고 status가 `pending` 또는 `indexing`이다
- **When** 업로드 완료 후 시간이 경과한다
- **Then** `GET /files/{file_id}`가 3초 간격으로 반복 호출된다
- **And** status가 `ready`로 바뀌면 파일 배지가 "준비됨"으로 업데이트된다
- **And** polling이 중단된다

#### Scenario: 업로드 후 indexing → error 전환

- **Given** 사용자가 파일을 업로드했고 인덱싱 중 오류가 발생했다
- **When** `GET /files/{file_id}` 응답의 status가 `error`로 변경된다
- **Then** 파일 배지가 "오류" 상태로 업데이트된다
- **And** polling이 중단된다

#### Scenario: DocList 파일 상태 배지 표시

- **Given** 파일 목록에 status별 파일이 혼재한다
- **When** DocList가 렌더링된다
- **Then** `pending` / `indexing` 파일에는 "인덱싱 중" 배지가 표시된다
- **And** `ready` 파일에는 "준비됨" 배지가 표시된다
- **And** `error` 파일에는 "오류" 배지가 표시된다

---

### Requirement: 파일 다운로드 — presigned URL

사용자가 파일 다운로드 버튼을 클릭하면 `GET /api/v1/files/{file_id}/download`를 호출하여 presigned URL을 받고 해당 URL로 이동한다.

#### Scenario: 파일 다운로드 성공

- **Given** 사용자가 `/docs` 페이지에서 특정 파일의 다운로드 버튼을 클릭했다
- **When** BFF를 통해 `GET /files/{file_id}/download`가 호출된다
- **Then** `FileDownloadResponse.download_url`을 수신한다
- **And** 브라우저가 해당 presigned URL로 이동하여 다운로드가 시작된다
