# Spec: doc-upload-page

## ADDED Requirements

### Requirement: doc-list-renders

**Description**: `/docs` 진입 시 드롭존과 목업 문서 4개 목록이 렌더링된다. 각 문서 행에는 파일명, 파일 크기, 처리 상태 배지, 삭제 버튼이 표시된다.

**Scenarios**:

#### Scenario: 문서 목록 표시

- **Given**: `/docs` 경로에 진입한 상태
- **When**: 페이지가 로드되면
- **Then**: 드롭존 영역이 보인다
- **And**: 목업 문서 4개 행이 표시된다
- **And**: 각 행에 파일명이 보인다
- **And**: 각 행에 파일 크기(예: "2.4 MB")가 보인다
- **And**: 각 행에 처리 상태 배지가 보인다
- **And**: 각 행에 삭제 아이콘 버튼이 보인다

---

### Requirement: doc-status-badge

**Description**: 문서 처리 상태에 따라 다른 배지 스타일이 적용된다. `ready` 상태는 "인덱싱 완료" secondary 배지, `indexing` 상태는 "처리 중" outline 배지(점 펄스 애니메이션 포함)로 표시된다.

**Scenarios**:

#### Scenario: 배지 상태 — 인덱싱 완료

- **Given**: 문서 status 가 `"ready"` 인 행
- **When**: 목록을 보면
- **Then**: "인덱싱 완료" 텍스트의 secondary 스타일 배지(neutral 채운 배경)가 표시된다

#### Scenario: 배지 상태 — 처리 중

- **Given**: 문서 status 가 `"indexing"` 인 행
- **When**: 목록을 보면
- **Then**: "처리 중" 텍스트의 outline 스타일 배지(테두리만)가 표시된다
- **And**: 배지 좌측에 펄스 애니메이션이 있는 점(dot)이 표시된다

---

### Requirement: doc-delete

**Description**: 문서 행의 삭제 버튼을 클릭하면 해당 문서가 목록에서 제거된다. 목업이므로 실제 API 호출 없이 클라이언트 상태에서만 제거된다.

**Scenarios**:

#### Scenario: 삭제 버튼 클릭

- **Given**: 문서 목록에 4개의 문서가 있는 상태
- **When**: 첫 번째 문서의 삭제 버튼을 클릭하면
- **Then**: 해당 문서가 목록에서 사라진다
- **And**: 나머지 3개 문서는 그대로 표시된다

#### Scenario: 목록 전체 삭제 후 빈 상태

- **Given**: 문서 목록에 1개의 문서만 남은 상태
- **When**: 그 문서의 삭제 버튼을 클릭하면
- **Then**: 문서 목록이 비어 있는 상태로 표시된다

---

### Requirement: dropzone-renders

**Description**: 드롭존은 파일을 드래그하거나 클릭해 선택할 수 있는 영역으로 렌더링된다. 목업이므로 실제 파일 업로드 처리는 없다.

**Scenarios**:

#### Scenario: 드롭존 기본 표시

- **Given**: `/docs` 페이지가 로드된 상태
- **When**: 드롭존 영역을 보면
- **Then**: "파일을 드래그하거나 클릭해 업로드하세요" 안내 문구가 보인다
- **And**: 드롭존은 border-dashed 테두리로 구분된 영역으로 표시된다

#### Scenario: 드래그 오버 시 시각적 피드백

- **Given**: 드롭존이 표시된 상태
- **When**: 파일을 드롭존 위로 드래그하면
- **Then**: 드롭존 배경색 또는 테두리 색이 accent 색상으로 변경된다 (drag-over 상태)
