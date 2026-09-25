# Work 0071 CODEX-04 — Phase B focus continuity and edit recovery

WORK_ID: 0071
DISPATCH_ID: 0071-CODEX-04
BALL: CODEX
STATUS: READY
MODE: BUILD
VALIDATION_TIER: TIER_2_STANDARD
USER_NATIVE_ACTION_BUDGET: 0
USER_PRESENCE_REQUIRED_BY_DEFAULT: NO

## Baseline

Phase A is integrated on main.

```text
PHASE_A_PR: #104
PHASE_A_MERGE: e9c759c569660331a1eb447cd44787ab1051c427
PHASE_A_RELEASE: 0.2.1
SCHEMA: 9
PHASE_A_INTEGRATION_READY: YES
BLOCKER: NONE
```

The valid-file exact-candidate runtime state remains explicitly `NOT_OBSERVED_AUTOMATION_LIMITATION`; do not reopen it. Native upload-path evidence is reused and no user action is required.

## Goal

Resolve only the material Phase B UX findings from CODEX-01 audit that remain reproducible on the current Phase A baseline:

1. Activity Analytics admin-check focus continuity after a rerender/reload path.
2. Master reorder focus continuity when row controls are replaced.
3. Past News / Assessment edit validation: field-level actionable error + safe first-invalid focus.
4. Past Meeting / Pitchbook lifecycle focus continuity after list rerender/removal.

Primary Outcome:

> async mutation or validation must not leave the user searching for where they were or what to fix next.

This is not a broad visual redesign.

## Read First

- nearest `AGENTS.md`
- `docs/planning/work0071-interaction-stability-ux.md`
- `docs/product/stable-interaction-layout.md`
- `docs/product/work0071-google-web-ux-adoption.md`
- `docs/handoffs/0071-CODEX-01-phase-a-interaction-stability-report.md`
- `docs/handoffs/0071-CODEX-03-phase-a-final-integration-qualification-report.md`
- `docs/decisions/target-runtime-first-development.md`
- current source for Activity Analytics, Past records, Master management

Applicable KB rules include UX-A11Y-002/003, UX-FORM-003/004/005, UX-CLS-003/005, UX-QA-002/005 and R02/R03 where applicable.

## Fastest Safe Decisive Action

Before editing each Phase B surface, reproduce the reported issue on current main using production HTML/client code in browser automation.

For each finding classify:

```text
REPRODUCED_MATERIAL
ALREADY_SATISFIED
NOT_REPRODUCED
AUTOMATION_LIMITATION
```

Only `REPRODUCED_MATERIAL` may justify surface-specific source changes.

Do not "fix" a finding only because CODEX-01 named it.

## Scope B1 — Activity Analytics admin-check focus

Current risk:

`activityRenderDrill()` replaces drill rows. The normal success path updates the checkbox in place, but missing-record/error refresh paths can call `loadActivityAnalytics()`, replacing the focused checkbox.

Required behavior if reproduced:

- preserve the logical focus identity: `meetingId`
- after a rerender, restore focus to the replacement `[data-activity-admin-meeting="<same id>"]` when it still exists
- if the record no longer exists, focus a stable list control/status/heading that makes the next action clear
- do not scroll to the top unexpectedly
- success/no-op path must not add unnecessary rerender
- request ordering safeguards remain intact
- do not change analytics calculation/data semantics

Acceptance:

```text
success focus continuity: PASS
error/reload focus continuity: PASS
record-missing fallback focus: PASS
unexpected scroll: 0
duplicate mutation: 0
```

## Scope B2 — Master reorder focus

Current code already restores focus after local arrow movement in some paths. Verify first.

Test:

- move up
- move down
- first/last row boundary
- save reorder
- reset reorder if applicable
- row/control replacement
- keyboard-only operation

If current main already returns focus correctly for a scenario, leave it unchanged.

For any reproduced gap:

- preserve stable identity by master option ID + intended action
- after row rerender, focus the replacement control for the moved/saved item when meaningful
- if that action becomes disabled/nonexistent, choose the nearest logical control within the same row, otherwise a stable reorder control
- do not introduce hidden focus traps
- drag behavior and reorder persistence contract unchanged

No Master API/schema changes.

## Scope B3 — Past News / Assessment edit validation

Current `sourceUpdate()` reports required-field errors mainly through the generic status area.

Use the Phase A inline-error primitive rather than inventing another validation system.

Required validation behavior:

News:
- Date
- Title
- at least one Counterparty
- Publisher

Assessment:
- Date
- Title
- at least one Counterparty
- Assessment Type

For a failed client validation:

- identify each invalid field with inline actionable text
- `aria-invalid=true`
- `aria-describedby`
- focus only the first actionable invalid field
- no RPC before client-required fields pass
- field error clears when corrected
- generic status may summarize, but must not be the only location
- server validation remains authoritative
- non-required fields and DIRECT_TEXT/upload semantics remain unchanged
- edit draft values remain intact after validation failure

Prefer shared helpers and small config, not duplicated News/Assessment blocks.

## Scope B4 — Past Meeting / Pitchbook lifecycle focus

Reproduce lifecycle operations where a clicked row/button is replaced by the subsequent search/render.

Meeting examples:
- delete/inactivate from Past
- list refresh after success

Pitchbook examples:
- inactivate
- reactivate when visible under the selected status filter
- list refresh after success

Required behavior if reproduced:

1. capture stable record identity and approximate list position before mutation
2. after rerender:
   - if same record remains visible, focus its corresponding lifecycle/detail action
   - if it disappears, focus the closest surviving row action by prior index
   - if list is empty, focus the search button or stable results heading/status
3. do not restore focus to a detached element
4. no unexpected top-of-page scroll
5. preserve existing confirmation dialogs and lifecycle semantics

Do not change Active/Inactive/Reactivate business rules.

## Explicit Non-Scope

Do not change:

- Add 4-source Phase A UI unless a direct regression is found
- upload/file marker/status logic
- Knowledge Search
- Full Output
- Entity Workspace
- provider/API behavior
- schema/migration
- permissions
- backup/triggers
- company production
- visual theme/rebrand

CODEX-01 audit found no material issue in Knowledge Search, Full Output, Entity Workspace, admin page or modal surfaces. Do not expand there without new direct evidence.

## Release / Distribution

If production source changes in CODEX-04:

```text
TARGET_RELEASE: 0.2.2
TARGET_SCHEMA: 9
```

- update release identity consistently
- freeze production source before generating distribution
- deterministic bundle
- exact source/file/payload hash mapping
- independent company multi-file BASIS pin
- 7-file parity
- no schema migration

If no production source changes are required because every finding is already satisfied/not reproduced, do not bump the release.

## Focused Browser Validation

Create or extend focused tests that use production HTML/client code.

At minimum:

### Analytics
- checkbox success retains logical focus
- error refresh restores same-ID focus when present
- missing-record fallback focus
- no unexpected scroll

### Master
- keyboard up/down focus continuity
- save/reset rerender continuity where applicable
- first/last boundary
- no lost focus/body focus

### Past News/Assessment
- invalid Date / Title / Counterparty / Publisher or Assessment Type
- RPC count 0 on client-invalid
- first-invalid focus
- correction clears field error
- values preserved

### Past lifecycle
- same-row remains visible -> replacement action focus
- row disappears -> nearest surviving row/fallback focus
- empty list fallback
- no focus on detached node

Use 1440 and 390 for changed surfaces. Add 320 smoke only where changed layout can materially affect reachability; do not repeat unrelated Phase A matrices.

## Target-Runtime Qualification

Because these are rendered interaction/focus behaviors, use the existing isolated owner-only Apps Script/Web App target if identity/isolation is confirmed.

This Dispatch must remain unattended.

```text
USER_NATIVE_ACTION_BUDGET: 0
```

No OS picker or native file interaction is needed.

Allowed maximum if production source changed:

```text
SOURCE_SYNC: 1
IMMUTABLE_VERSION: 1
EXISTING_DEPLOYMENT_UPDATE: 1
NEW_DEPLOYMENT: 0
NEW_TARGET: 0
```

Use synthetic/anonymized records only.

Minimum runtime evidence should cover one representative actual rerender/focus mutation from each changed class where safely possible:
- Activity Analytics admin check
- Master reorder or save
- Past source edit validation
- Past lifecycle

Do not repeat file upload, provider, migration, concurrency, or unrelated page qualification.

If a target-runtime path needs data not safely available, use an isolated synthetic record. Do not touch company/confidential data.

## Side-effect Boundary

Not authorized:

- company production
- company/confidential data
- provider/indexing/billing
- broad access changes
- permission changes
- schema/migration
- trigger changes
- physical delete
- destructive cleanup
- user-native action

AI sync remains disabled.

## Validation Gates

Focused tests first.

Then, after final material source change:

```text
python tools/validate_agent_foundation.py
npm run check
git diff --check
```

Do not weaken assertions.

Report separately:

```text
PHASE_B_AUDIT_RECHECK
ANALYTICS_FOCUS
MASTER_REORDER_FOCUS
PAST_SOURCE_INLINE_VALIDATION
PAST_LIFECYCLE_FOCUS
RESPONSIVE_1440
RESPONSIVE_390
KEYBOARD_FOCUS
LOGIC_VALIDATION
TARGET_RUNTIME_QUALIFICATION
SIDE_EFFECT_STATE
USER_NATIVE_ACTION_COUNT
BLOCKER
FOLLOW_UP
READY
```

## Strategy Reset

Stop and return if:

- a focus fix requires changing server/lifecycle semantics
- a finding is not reproducible and implementation would be speculative
- 2 materially different focus-restoration approaches fail
- latest main introduces source conflict
- target identity/isolation cannot be confirmed
- qualification would require company data or user-native action

## Delivery

Create branch from latest main:

`work/0071-phase-b-interaction-continuity`

Open one Draft PR.

Report:

`docs/handoffs/0071-CODEX-04-phase-b-focus-recovery-report.md`

Update:

`docs/handoffs/0071-dispatches.md`

Do not mark Work0071 ACCEPTED or apply Completion Latch. Return to ChatGPT for final Work0071 review.

## Mandatory final identity

```text
WORK_ID: 0071
DISPATCH_ID: 0071-CODEX-04
BALL: CHATGPT
STATUS: RETURNED
```

WORK_ID: 0071
DISPATCH_ID: 0071-CODEX-04
BALL: CODEX
STATUS: READY
