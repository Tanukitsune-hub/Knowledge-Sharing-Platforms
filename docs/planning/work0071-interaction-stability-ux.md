# Work 0071 — Interaction-stable async UX

WORK_ID: 0071
DISPATCH_ID: N/A
BALL: NONE
STATUS: READY
MODE: BUILD
VALIDATION_TIER: TIER_2_STANDARD
ROUTE: A -> C
BASELINE: Work0070 ACCEPTED / release 0.2.0 / schema9

## Primary Outcome

Alternative Assets Intelligenceの主要ユーザーフローを、保存・upload・検索・集計等の非同期状態変化があっても「押す場所・読む場所・focus位置を探し直さなくてよい」interaction modelへ収束させる。

単にCLS値を下げるのではなく、以下を同時に成立させる。

- primary action geometry stability
- immediate truthful feedback
- safe retry / partial failure comprehension
- keyboard/focus continuity
- narrow viewport / zoom usability
- authoritative data / server contract preservation

## Canonical Product Sources

- UX direction: `docs/product/stable-interaction-layout.md`
- Google Web UX KB adoption: `docs/product/work0071-google-web-ux-adoption.md`
- Project Source: `web_ux_knowledge_v1_20260925.md` / `GOOGLE-WEB-UX-KB` v1.0
- Existing async baseline: Work0049
- Current record-layer baseline: Work0070

GOOGLE-WEB-UX-KBは参照知識であり、GitHub正本・明示要件・security/data contractを上書きしない。

## Closed Conclusions

- Work0049のbutton spinner / `aria-busy` / duplicate prevention / reduced-motion contractは維持する。
- Work0070のretry / unknown-outcome / concurrency / 4-tab state / schema9 contractは再設計しない。
- primary issueはfeedback不足ではなく、feedback/file metadata/content expansionでgeometryが不必要に動くこと。
- normal mutationにfullscreen overlayを導入しない。
- fake progress percentageを導入しない。
- UX向上のためにbackend/schema/provider contractを変えない。
- 64 UX rulesを全適用しない。applicableなruleだけを採用する。

## Selected Web UX KB Rules

Core MUST:

```text
UX-MET-001
UX-CLS-002
UX-CLS-003
UX-CLS-004
UX-CLS-005
UX-INP-001
UX-A11Y-002
UX-A11Y-003
UX-A11Y-008
UX-FORM-003
UX-FORM-004
UX-FORM-005
UX-FORM-007
UX-RWD-001
UX-RWD-004
UX-QA-001
UX-QA-002
UX-QA-005
UX-QA-006
R03
T02 / T03 / T04 / T05 / T07
```

Conditional SHOULD:

```text
UX-RWD-003
UX-RWD-006
UX-A11Y-005
UX-NAV-005
R02
R05
T09 / T10 / T12
```

Detailed applicability and explicit defers are canonicalized in:

`docs/product/work0071-google-web-ux-adoption.md`

## Fastest Safe Decisive Action

Before implementation:

1. current mainをexact baselineとしてsynthetic browserでbefore geometryを測る。
2. Phase A representative flowでprimary action / status / file queueのmovement原因を定量化する。
3. one shared interaction shellのsmallest designを選ぶ。
4. そのpatternだけをPhase Aへ実装する。
5. after geometry + keyboard/focus + recoveryを同条件で比較する。
6. Phase Bはbefore evidenceで同じ問題があるsurfaceだけへ展開する。

大量のapp-wide CSS rewriteを先にしない。

## Phase A — Required Scope

### A1. Add / Meeting

- primary 登録actionをdynamic attachment/file/status growthから分離。
- meeting save + material partial-success/retryのstatusをstable regionで表示。
- existing server/retry semantics unchanged。

### A2. Add / standalone 保存資料

- save/retry/clear controlsをfile list growthから分離。
- 1 file / multiple / max 10 / long name / generated name / pending / retryでprimary action geometryを安定。
- original filenameをprimary identityとして維持。

### A3. Add / News

- save action geometryをDIRECT_TEXT/UPLOAD_FILE/status changesから安定化。
- validation errorをfield近傍で理解可能にする。
- explicit safe focus behavior。

### A4. Add / 評価

Newsと同じshared contractを使用し、source-specific duplicate implementationを増やさない。

### A5. Shared status primitive

現行 `showStatus` を壊さず、対象surfaceでstable geometryを持てるsmall variant/helper/CSS contractを導入。

候補:

```text
idle
validating
pending
success
warning
error
recovery-required
```

statusを隠すためではなく、同じ領域を置換するために使う。

### A6. Shared file queue primitive

- original filename
- secondary saved/generated filename
- size
- row status / retry status
- optional detail affordance

をstable row内へ整理する。

bounded internal scrollはbefore measurementでpage action movementへ実益がある場合のみ採用。

## Phase B — Evidence-gated Expansion

Phase A completion後、before auditでmaterialな同種問題を観測したsurfaceだけ変更する。

候補:

- Past edit/lifecycle
- Knowledge Search
- Full Output
- Activity Analytics
- Entity Workspace
- Master / 管理者ページ
- modal mutations

問題を観測しないsurfaceは変更しない。

## Non-Goals

- public SEO / landing-page optimization
- image/font/ad optimization
- new Worker/content-visibility/preload architecture
- new RUM or analytics collection
- bfcache / cache-policy change
- provider/API implementation
- 4-source Knowledge Search implementation
- Full Output source-parity business logic
- schema/migration
- visual brand redesign
- toast framework redesign
- blanket 48px conversion of all dense controls

## Acceptance Evidence

### Geometry

Representative primary actions:

```text
PRIMARY_ACTION_SHIFT_X <= 1 CSS px
PRIMARY_ACTION_SHIFT_Y <= 1 CSS px
PRIMARY_ACTION_SIZE_CHANGE <= 1 CSS px
UNEXPECTED_PAGE_SCROLL = 0
MATERIAL_STATUS_LAYOUT_JUMP = 0
```

Compare:

```text
idle
file/input ready
validating
pending
success
validation error
server error
partial success
retry required
```

### Interaction / form recovery

- action feedback visible before RPC settles.
- duplicate submit remains blocked.
- explicit validation error identifies location/reason/fix route.
- input remains available after recoverable failure.
- unknown outcome remains fail-closed.
- server result and UI status agree.

### Focus / accessibility

- keyboard-only representative flow PASS.
- async status does not steal focus.
- sticky/overlay, if used, does not fully obscure focus target.
- status remains available to assistive technology.
- reduced-motion path preserves business result.
- success/warning/error are not color-only.

### Responsive

Changed surfaces:

- 1440px
- 390px
- 320 CSS px smoke
- 200% text / high-zoom smoke where browser harness permits

No new material horizontal overflow; primary action remains reachable.

### Regression

- Work0070 save/retry/idempotency/concurrency contract unchanged.
- source IDs / Drive / Index result unchanged.
- Work0049 busy feedback remains available.
- no provider calls.
- no schema/migration/permission change.
- canonical `npm run check` PASS when touched source is covered.
- `git diff --check` PASS.

## Evidence Hierarchy

1. actual rendered target Web App interaction / geometry readback
2. browser automation against exact candidate
3. deterministic production-source tests
4. static inspection

A screenshot alone does not prove interaction stability. Geometry, focus, action result and scroll state should be read back.

## Validation

Default `TIER_2_STANDARD`.

Target-runtime browser smoke is required because Primary Outcome is rendered interaction behavior.

Escalate to `TIER_3_HIGH` only if implementation must change:

- retry/outcome-unknown state
- concurrency
- persistence
- server mutation semantics
- permissions
- schema/provider behavior

## Execution Budget

When CODEX-01 starts:

- one shared interaction pattern
- speculative redesign attempts: max 2
- app-wide expansion before Phase A PASS: 0
- target runtime deployment cycles: max 2 unless material new evidence
- canonical full check: once after focused checks, rerun only after material subsequent source change

## Strategy Reset

Reset if:

- stable layout requires changing business/retry semantics.
- sticky/overlay creates focus-obscuration or mobile usability worse than baseline.
- same geometry failure remains after 2 materially different approaches.
- implementation turns into broad visual redesign.
- Phase B grows without before evidence.

## Current State

Planning and source adoption review complete.

```text
WORK0070_BASELINE: ACCEPTED
GOOGLE_WEB_UX_KB_REVIEWED: YES
ADOPTION_MATRIX: docs/product/work0071-google-web-ux-adoption.md
BLOCKER: NONE
READY_FOR_IMPLEMENTATION_DISPATCH: YES
NEXT_DISPATCH: UNASSIGNED
```
