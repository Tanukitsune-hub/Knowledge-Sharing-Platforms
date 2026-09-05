# Work 0028 dispatch control

WORK_ID: 0028
ACTIVE_DISPATCH_ID: NONE
BALL: CHATGPT
STATUS: ACTIVE
MODE: DESIGN

## Outcome

Improve Knowledge Shareのデザイン、操作性、画面内の情報設計、表示文言を、既存システムの機能・backend・data contractsを大幅改修せずに改善する。

このWorkはまずDESIGN phaseから開始する。最初に複数のmock directionを比較し、userが方向性を選ぶまでproduction source implementationは開始しない。

## Governing decision

`docs/decisions/ui-surface-language-and-backend-preservation.md`

Key constraints:

- preserve accepted Work 0027 baseline;
- no speculative backend/schema/provider/lifecycle redesign;
- internal technical names do not bind user-facing labels;
- normal-user language should describe intended user action and visible outcome;
- `Inactive` may surface as `削除`, with confirmation copy explaining retained/restorable data where material;
- existing ChatGPT / Gemini / 全文出力 route semantics remain truthful and are not silently converted into automatic routing;
- prefer HTML/CSS/client-side presentation changes after design selection.

## Phase A — visual exploration

BALL: CHATGPT
STATUS: ACTIVE

Deliver three deliberately distinct mock directions using the same existing product capabilities:

1. Minimal / Search-forward
2. Workspace / Notion-like
3. Investment Dashboard

Representative screens should cover at least:

- application shell / navigation / landing state;
- Meeting/Pitchbook maintenance or past-record list with edit, delete, deleted-state and restore actions;
- Knowledge Search request form and result/citation presentation.

Also produce:

- current-to-user-facing terminology map;
- trade-off comparison;
- scenario-based heuristic review because external user testing is not expected;
- one recommended direction, without implementing it before user selection.

## Design evaluation scenarios

At minimum walk each mock through:

1. 初回利用者が過去のMeetingを探す;
2. 既存recordを編集する;
3. recordを「削除」して通常一覧から消す;
4. 削除済みrecordを復元する;
5. Knowledge Searchで質問し、回答からcitation/sourceへ進む;
6. provider/全文出力の既存選択を理解する.

Evaluate discoverability, click/decision count, terminology clarity, visual density, source/citation readability, and implementation risk.

## Implementation gate

Do not allocate a CODEX dispatch, edit `src/`, create a runtime version, or deploy the Web App during Phase A.

Only after the user explicitly selects or combines a mock direction may Work 0028 move to BUILD and allocate `0028-CODEX-01` or later dispatch IDs.

## Completion latch for Phase A

```text
THREE_DISTINCT_MOCK_DIRECTIONS: PASS | FAIL
SAME_FUNCTIONAL_SCOPE_ACROSS_MOCKS: PASS | FAIL
TERMINOLOGY_MAP: PASS | FAIL
DELETE_RESTORE_SURFACE_LANGUAGE: PASS | FAIL
SCENARIO_REVIEW: PASS | FAIL
IMPLEMENTATION_RISK_COMPARISON: PASS | FAIL
USER_DIRECTION_SELECTED: YES | NO
SOURCE_CODE_CHANGED: NO
RUNTIME_CHANGED: NO
BALL: CHATGPT
STATUS: ACTIVE | READY_FOR_BUILD
```

WORK_ID: 0028
ACTIVE_DISPATCH_ID: NONE
BALL: CHATGPT
STATUS: ACTIVE
