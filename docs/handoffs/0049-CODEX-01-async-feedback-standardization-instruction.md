# Work 0049 CODEX-01 — 全アプリ非同期処理フィードバック標準化

WORK_ID: 0049
DISPATCH_ID: 0049-CODEX-01
BALL: CODEX
STATUS: READY
MODE: BUILD

## Primary Outcome

Knowledge Share全体で、利用者が待つ必要のある登録・追加・保存・変更・削除・復元・関連付け・同期・長時間処理について、処理開始直後から完了/失敗まで一貫した「処理中」表示を提供する。

Work0048 version30をbaselineとし、既存のbusiness logic / retry semantics / lockingを変えず、UI feedbackだけを標準化する。

## Recommended model

GPT-5.6 Sol High。

理由: 複数client moduleを横断し、既存のoperation-specific busy state / duplicate prevention / retry semanticsを壊さず共通UXを導入する必要があるため。2026-09時点のOpenAI公式仕様でもHighはGPT-5.6 Solの拡張推論設定。

## Read first

- `docs/handoffs/0049-async-operation-feedback-requirements.md`
- `docs/planning/work0049-async-operation-feedback.md`
- `docs/handoffs/0048-completion-report.md`
- `docs/design/ui-japanese-copy-guidelines.md`

## UX Standard

Three layers:

1. Action button
   - disabled
   - `aria-busy="true"`
   - shared spinner
   - action-specific label e.g. `追加中…`, `保存中…`, `復元中…`

2. Existing status area
   - where available, `info busy` + concise Japanese status
   - modal operations should prefer modal-local status

3. Affected region
   - `aria-busy="true"`
   - disable only conflicting controls
   - do not block unrelated page areas

Normal save/add operations must not use a full-screen overlay.

No fake progress percentages.

## Shared implementation

Prefer a small shared client helper such as:

```js
kspSetActionBusy(button, true, '追加中…')
kspSetActionBusy(button, false)
```

or equivalent.

Required helper behavior:
- original label safely restored
- idempotent repeated start/end
- busy class + aria-busy + disabled synchronized
- spinner rendered by shared CSS, not bespoke inline HTML per button
- nested content not corrupted
- reduced-motion supported
- failure path restores controls

Do not hide business logic inside the helper. RPC ownership / retry logic remains in existing operation functions.

## Required mutation inventory

At minimum cover:

### Registration / Meeting / Materials
- new Meeting registration
- Meeting edit Save
- Meeting delete
- Counterparty quick add
- attachment add/upload
- existing material link / unlink
- Pitchbook metadata update
- Pitchbook deactivate / reactivate

### Master Management
- Counterparty add
- Option add: ASSET_CLASS / LOCATION / TEAM
- Work0047 rename modal Save
- Master deactivate / reactivate
- Work0046 reorder Save

### Admin
- deleted Meeting restore
- Theme Save / Reset
- Provider connect / enable / disable / sync
- model policy migrate / save / qualify

### Analytics
- admin/monthly check mutation

### Knowledge / Export
- AI search start / pending check existing busy behavior
- export preview
- Full Output / Docs / PDF generation and other user-triggered long operations

Read-only flows with existing good feedback may remain unchanged.

## Decisive user-observed case

Master Management Option Add must visibly show on first click:

```text
Add click
-> button spinner + 追加中…
-> button disabled
-> relevant input/conflicting action disabled
-> one RPC only
-> success or error
-> controls recover
```

Do not rely on a second click to reveal that a request is already in flight.

## Natural Japanese

User-facing wording must follow `docs/design/ui-japanese-copy-guidelines.md`.

Avoid awkward technical/AI phrasing. Use action-specific natural wording.

## Preserve accepted Work

- Work0045 Theme Settings persistence and behavior
- Work0046 staged reorder contract
- Work0047 rename modal / empty pill fix
- Work0048 manual deleted-record search
- owner-only deployment/access
- Work0030 deferred

## Tests

Create/maintain an async-feedback matrix that proves for each covered mutation category:

- feedback visible before RPC settles
- trigger button disabled
- processing label visible
- duplicate request blocked
- success state correct
- failure restores controls and shows error

Focused decisive cases:
- ASSET_CLASS / LOCATION / TEAM Add
- rename modal Save
- Meeting registration/save
- deleted-record restore
- Theme Save
- Provider mutation
- export generation

Also:
- shared helper unit tests
- reduced-motion CSS coverage
- aria-busy tests
- no material layout jump at 1440 / 390

Then:
- focused tests
- `npm run check`
- bundle regeneration
- `npm run check:bundle`
- `git diff --check`

## Runtime qualification

Same owner-only Web App.

Expected final served version: 31.

Runtime evidence:
- representative feedback screenshots/states on desktop and mobile
- Master Option Add must be verified live with a safe reversible/synthetic option if possible
- do not mutate real business data merely to test every action; use deterministic client tests where live mutation would create unnecessary state changes
- all 7 normal pages nonblank at 2560 / 1440 / 1280 / 390
- console material error/warn 0
- no unrelated provider calls
- final data/master state restored

## Safety

```text
BUSINESS_LOGIC_CHANGE: 0 expected
BACKEND_API_CHANGE: 0 expected
SCHEMA_CHANGE: 0
MIGRATION_CHANGE: 0
PROVIDER_POLICY_CHANGE: 0
PERMISSION_BROADENING: 0
PUBLIC_EXPOSURE: 0
FAKE_PROGRESS_PERCENT: 0
FULLSCREEN_OVERLAY_FOR_NORMAL_MUTATION: 0
WORK_0030: DEFERRED_BY_USER
```

If a generic helper would require changing retry/business semantics, stop and keep the feedback integration local rather than broadening the abstraction.

## Delivery

Branch:
`codex/0049-async-feedback-standardization`

Draft PR, do not merge.

Report:
`docs/handoffs/0049-CODEX-01-async-feedback-standardization-report.md`

Update:
`docs/handoffs/0049-dispatches.md`

Report must include:
- complete mutation feedback matrix
- exact production source files changed
- shared helper/CSS contract
- Master Option Add first-click evidence
- duplicate-RPC evidence
- failure recovery evidence
- reduced-motion / aria-busy evidence
- tests / bundle / runtime
- served version
- final data state
- side effects
- BLOCKER / READY_FOR_CHATGPT_FINAL_REVIEW

WORK_ID: 0049
DISPATCH_ID: 0049-CODEX-01
BALL: CODEX
STATUS: READY
