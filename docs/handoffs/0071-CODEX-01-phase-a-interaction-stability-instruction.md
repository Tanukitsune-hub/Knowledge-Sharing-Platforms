# Work 0071 CODEX-01 — Phase A interaction stability

WORK_ID: 0071
DISPATCH_ID: 0071-CODEX-01
BALL: CODEX
STATUS: READY
MODE: BUILD
VALIDATION_TIER: TIER_2_STANDARD

## Goal

Work0070でACCEPTEDになったrelease 0.2.0 / schema9をbaselineとして、Alternative Assets Intelligenceの「記録を追加」4 sourceとshared file upload / retryのinteractionを安定化する。

Primary Outcomeは、save / upload / validation / retry等の非同期状態変化があっても、利用者が主要button・読位置・focus位置を探し直さなくてよいこと。

単なる見た目変更ではなく、以下を同時に満たす。

- primary action geometry stability
- truthful immediate busy/status feedback
- safe retry / partial-failure comprehension
- keyboard/focus continuity
- 1440 / 390 / 320 CSS pxでのreachability
- Work0049 / Work0070 contractsの完全維持

## Read First

1. nearest `AGENTS.md`
2. `docs/planning/work0071-interaction-stability-ux.md`
3. `docs/product/stable-interaction-layout.md`
4. `docs/product/work0071-google-web-ux-adoption.md`
5. `docs/handoffs/0049-async-operation-feedback-requirements.md`
6. `docs/handoffs/0070-completion-report.md`
7. `docs/decisions/target-runtime-first-development.md`
8. changed frontend source and its directly coupled tests

Google Web UX KBのselected rule mappingはGitHubのadoption documentを正本とする。64 ruleを再展開・全適用しない。

## Baseline / Closed Conclusions

- Work0070: ACCEPTED / PR #103 / release 0.2.0 / schema9。
- Work0049 busy-feedback standardは維持する。
- `kspSetActionBusy()`, button spinner, `aria-busy`, duplicate-submit prevention, reduced-motion behaviorを壊さない。
- Work0070のretry / unknown-outcome / partial-upload / concurrency / 4-tab state contractを再設計しない。
- backend/schema/provider/security/deployment-access semanticsは変更しない。
- normal mutationにfullscreen overlayを導入しない。
- fake progress percentageを導入しない。
- primary issueは「feedbackがない」ではなく、「feedback / file metadata / state contentが周囲のgeometryを押し広げる」こと。

## Selected UX Rules

Implementation decisions must be traceable to the adopted rules, especially:

```text
UX-CLS-002
UX-CLS-003
UX-CLS-004
UX-CLS-005
UX-INP-001
UX-FORM-003
UX-FORM-004
UX-FORM-005
UX-FORM-007
UX-A11Y-002
UX-A11Y-003
UX-A11Y-008
UX-RWD-001
UX-RWD-004
UX-QA-001
UX-QA-002
UX-QA-005
UX-QA-006
R03
T02 / T03 / T04 / T05 / T07
```

Do not cite a rule as evidence that this app improved. Improvement must be measured in this app.

## Fastest Safe Decisive Action

Before editing production source, capture a small before-measurement matrix against the accepted Work0070 UI.

At minimum measure:

- primary action bounding rect
- relevant status region rect
- file queue/list height
- document scroll position
- activeElement/focus
- horizontal overflow

for representative Phase A states.

Do not spend the entire run building a generic measurement framework. A focused browser helper/test is enough if reproducible.

## Phase A Required Scope

### A1 — Meeting add

Stabilize the main registration action against:

- validation status
- save pending/success/error
- attachment selection
- attachment file rows
- partial material success / retry-required messaging

Primary registration action must not be pushed vertically by transient status/file row changes.

Keep Meeting save semantics unchanged.

### A2 — Standalone 保存資料

Stabilize:

- `資料を保存`
- retry
- clear
- file queue
- summary/status

against:

- no file
- one file
- multiple files
- max 10 synthetic files
- long Japanese/Latin filename
- saved/generated filename appearance
- pending
- success
- retry required

Original filename remains the primary row identity.

Do not create a parallel upload architecture.

### A3 — News add

Stabilize the save action across:

- DIRECT_TEXT
- UPLOAD_FILE
- client validation
- pending
- success
- explicit safe server error
- recovery-required state

Where validation can identify a specific field, provide an inline actionable error contract rather than relying only on the global status.

Preserve server validation as authoritative.

### A4 — Assessment add

Use the same shared interaction primitives and error contract as News wherever applicable.

Do not duplicate source-specific UI infrastructure without a concrete need.

### A5 — Stable status primitive

Introduce the smallest shared helper/CSS contract needed so selected status regions can occupy stable geometry across:

```text
idle
validating
pending
success
warning
error
recovery-required
```

Requirements:

- existing `showStatus()` callers outside scope keep working.
- no giant permanent blank region.
- short states replace content inside one stable slot.
- long actionable errors may use explicit detail/secondary area if needed.
- retry/unknown outcome information must remain visible until resolved.
- `aria-live` / `aria-busy` semantics remain correct.

### A6 — Stable file queue

Refine the existing shared Pitchbook/material file queue:

- original filename = stable primary identity
- generated/saved filename = secondary metadata/detail
- size = stable secondary field
- status = same-row replacement
- retry/partial failure remains attributable to a file
- long filename does not cause primary action displacement
- hover is not the only route to full detail

Use bounded internal scrolling only if before measurement proves it materially reduces page/action displacement and it does not create a worse nested-scroll experience.

### A7 — Action placement

The product direction allows upper/sticky action placement, but do not apply sticky by default.

Prefer the smallest layout that separates primary actions from dynamic content.

If sticky/overlay is used:

- no full focus target is obscured
- keyboard order matches visual order
- 390 / 320 CSS px remain usable
- soft keyboard / zoom risk is considered
- normal page navigation is not trapped

## Phase B — Audit Only in CODEX-01

After Phase A implementation, inspect but do not redesign:

- Past edit/lifecycle
- Knowledge Search
- Full Output
- Activity Analytics
- Entity Workspace
- Master / 管理者ページ
- modal mutations

Record only material instances of the same class:

- primary action moved by async status/result
- focus stolen/obscured
- stale result overwrites current UI
- error/retry path is hard to understand
- dynamic result pushes current operation controls

Do not implement Phase B surface-specific fixes in CODEX-01 unless the Phase A shared primitive fixes them automatically with no new product/surface-specific code.

Route concrete remaining items to CODEX-02.

## Expected Source Areas

Likely touched:

- `src/ClientCore.html`
- `src/ClientPitchbookFiles.html`
- `src/ClientPitchbookFlow.html`
- `src/ClientSourceRecords.html`
- `src/Index.html`
- `src/Styles.html`
- focused browser/unit tests
- generated bundle / company package

This is not a mandatory file list. Do not change unrelated files to match it.

## Non-Goals

Do not implement:

- provider/API changes
- Knowledge Search 4-source business logic
- Full Output source-parity business logic
- Internal Assessment Digest
- schema/migration
- permissions/access changes
- new telemetry/RUM
- SEO/LCP/image/font optimization
- Worker/content-visibility/preload/prefetch
- broad visual rebrand
- toast framework redesign
- blanket 48px conversion of dense controls
- company production rollout

## Authorization / Runtime Boundary

Repository implementation and isolated target-runtime UI qualification are authorized.

Preferred runtime:

- reuse the accepted Work0070 isolated owner-only Apps Script / Workspace / Web App target if its identity and isolation can be confirmed.
- do not create a new target unless the existing isolated target is unavailable or contaminated; if a new target would be needed, stop and return the reason before creating it.

Allowed:

- branch/source/test/generated artifact changes
- synthetic browser fixtures
- same isolated target source sync
- immutable version/deployment update on the same owner-only test deployment
- synthetic records/files needed for changed interaction flows

Not authorized:

- company production Apps Script/Drive/Sheets migration
- company/confidential data
- broad/domain Web App access
- provider calls/indexing/billing
- credentials
- permission broadening
- physical delete
- trigger changes other than preserving the already-existing test-only daily backup trigger state
- destructive cleanup

AI sync stays disabled.

## Validation — Focused First

### Before/after geometry

At minimum compare representative primary actions in Meeting / standalone Pitchbook / News / Assessment.

Acceptance target:

```text
PRIMARY_ACTION_SHIFT_X <= 1 CSS px
PRIMARY_ACTION_SHIFT_Y <= 1 CSS px
PRIMARY_ACTION_SIZE_CHANGE <= 1 CSS px
UNEXPECTED_PAGE_SCROLL = 0
FOCUS_LOSS = 0
MATERIAL_STATUS_LAYOUT_JUMP = 0
```

Across relevant states:

```text
idle
input/file ready
validating
pending
success
validation error
server error
partial success
retry required
```

If 1px is not technically stable in the actual renderer, record measured variance and stop for ChatGPT decision rather than silently weakening the criterion.

### Responsive / accessibility

Changed surfaces:

- 1440px
- 390px
- 320 CSS px smoke
- keyboard-only representative save flow
- 200% text / high-zoom smoke where harness supports it
- reduced motion

Check:

- no material horizontal overflow
- primary action reachable
- no focus target fully obscured
- status does not steal focus
- error path has location/reason/fix route
- full filename/detail reachable without hover-only dependency

### Recovery / integrity

- duplicate submit still blocked
- unknown outcome remains fail-closed
- explicit safe failure remains recoverable
- partial file failure maps to the correct file/retry action
- client UI never reports success before server result
- Work0070 source IDs/Drive/Index semantics unchanged

### Phase B audit

Produce a bounded table:

```text
surface | observed issue | before evidence | Decision-Impact | route
```

Only material, reproducible issues. Do not turn every small visual preference into follow-up scope.

### Deterministic / generated

- focused tests for shared stable status/action/file queue
- focused validation/error/focus tests
- existing Work0049 busy helper regression
- existing Work0070 source/client regression directly coupled to changed files
- generated bundle validation
- 7-file company package parity
- `npm run check` once after focused tests
- `git diff --check`

## Target-runtime qualification

Because Primary Outcome is rendered interaction, actual target Web App evidence is required.

Use the exact final candidate source.

Minimum actual runtime matrix:

- Meeting representative save/status
- standalone Pitchbook file flow
- News save/validation
- Assessment save/validation
- one retry/error state that can be exercised without contaminating accepted data
- 1440 + 390
- keyboard/focus smoke
- final console material error/warn = 0

Do not repeat Work0070 migration/concurrency qualification unless the implementation materially changes those contracts.

## Execution Budget

- one shared interaction pattern
- speculative redesign attempts: max 2
- Phase B surface-specific implementation in CODEX-01: 0
- source sync to isolated target: max 2
- immutable version/deployment update cycles: max 2
- canonical full check: once after focused validation; repeat only after material source change
- no blind repeat of a stateful failure

## Strategy Reset

Stop and return if:

- stable layout requires changing retry/outcome-unknown/concurrency/server semantics
- sticky/overlay obscures focus or makes mobile worse and a second distinct approach also fails
- same geometry failure persists after 2 materially different implementations
- a browser harness limitation is being mistaken for an app defect
- Phase A expands into broad visual redesign
- isolated runtime identity cannot be confirmed

## Delivery

Branch:

`work/0071-interaction-stability`

Open one Draft PR.

Report:

`docs/handoffs/0071-CODEX-01-phase-a-interaction-stability-report.md`

Update:

`docs/handoffs/0071-dispatches.md`

Report must distinguish:

```text
RULES_APPLIED
BEFORE_GEOMETRY
AFTER_GEOMETRY
PHASE_A
PHASE_B_AUDIT
KEYBOARD_FOCUS
RESPONSIVE_1440
RESPONSIVE_390
RESPONSIVE_320
TEXT_ZOOM
REDUCED_MOTION
RECOVERY
WORK0049_REGRESSION
WORK0070_REGRESSION
LOGIC_VALIDATION
BUNDLE_VALIDATION
MULTIFILE_PACKAGE_PARITY
TARGET_RUNTIME_QUALIFICATION
SIDE_EFFECT_STATE
PROVIDER_CALL_COUNT
COMPANY_DATA_MUTATION_COUNT
BLOCKER
FOLLOW_UP
READY
```

Do not mark Work0071 ACCEPTED or apply Completion Latch. Return Draft PR to ChatGPT for review.

## Mandatory final identity

Begin and end final Codex response with:

```text
WORK_ID: 0071
DISPATCH_ID: 0071-CODEX-01
BALL: CHATGPT
STATUS: RETURNED
```

If native file selection or other unavoidable user gesture is required, keep the same Dispatch ID and return:

```text
BALL: USER
STATUS: ACTION_REQUIRED
```

WORK_ID: 0071
DISPATCH_ID: 0071-CODEX-01
BALL: CODEX
STATUS: READY
