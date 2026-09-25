# Work 0071 CODEX-02 — Phase A repair + file identity marker

WORK_ID: 0071
DISPATCH_ID: 0071-CODEX-02
BALL: CODEX
STATUS: READY
MODE: BUILD
VALIDATION_TIER: TIER_2_STANDARD

## Goal

Draft PR #104のCODEX-01 evidenceを保持しつつ、ChatGPT reviewで確認した限定事項だけを修正してPhase Aをtarget-runtimeで再qualificationする。

このDispatchでは以下を同じPRで行う。

1. standalone資料保存の矛盾statusを修正
2. user decisionの朱色file markerをshared file queueへ追加
3. Work0071と無関係なAGENTS.md compact rewriteをrevert
4. distribution integrityを弱めた変更をrevertし、release identityを明確化
5. exact repaired candidateをisolated targetで1回再qualification

Phase B surface-specific implementationは行わない。

## Read First

- nearest `AGENTS.md`
- `docs/planning/work0071-interaction-stability-ux.md`
- `docs/product/stable-interaction-layout.md`
- `docs/product/work0071-google-web-ux-adoption.md`
- `docs/decisions/bundle-integrity-and-installer-security.md`
- `docs/decisions/modular-source-single-bundle-distribution.md`
- `docs/handoffs/0071-CODEX-01-phase-a-interaction-stability-report.md`
- Draft PR #104 current diff
- `docs/handoffs/0071-dispatches.md`

## Preflight — reconcile latest main

Before editing:

1. fetch latest `origin/main`
2. normal merge into `work/0071-interaction-stability`
3. no rebase / force push
4. expected new main changes are Work0071 product/planning/dispatch docs
5. production source conflictが出たらSTOPしてChatGPTへ返す
6. preserve CODEX-01 accepted before/after evidence

## ChatGPT Review Findings

### Finding 1 — standalone primary status remains stale after valid file selection

Actual target-runtime evidence:

- initial submit with no file correctly shows `ファイルを1つ以上選択してください。`
- valid native file selection then succeeds
- file panel status is cleared/updated
- but `standalone-pitchbook-status` retains the stale no-file error
- pending shows `資料を保存中…` in file-panel status while stale error remains in the primary stable status slot

This violates the Work0071 Primary Outcome and UX-FORM-005 / UX-CLS state-consistency contract.

Required repair:

- when standalone file selection becomes valid, clear the obsolete no-file validation/status from `standalone-pitchbook-status`
- on standalone submit start, primary stable status must immediately show a truthful pending message such as `資料を保存中…`
- success/error/retry state must update the same primary status coherently
- file-local status may remain for per-file detail/retry, but it must never contradict the primary status
- invalid no-file submit must still show the actionable error
- Meeting parent-bound material flow must not regress

Add a focused browser test reproducing exactly:

```text
submit without file
-> primary error visible
-> select valid file
-> obsolete primary error cleared
-> submit
-> pending primary status is 保存中
-> no visible contradictory no-file error
-> success
```

### Finding 2 — user decision: vermilion file identity marker

User decision 2026-09-26:

Every uploaded/material file row should have a small vermilion circular marker immediately before the original filename.

Semantics:

- marker means only: "this row is a material/file item"
- marker is NOT a save/error/status indicator
- Selected / Saving / Saved / Retry required do not change marker color
- state remains textual/badge-based
- do not encode status by color alone

Initial visual contract:

- small circle, approximately 8px diameter
- approximately 10px gap before filename
- vermilion/orange-red default such as `#D94A2A` or an equivalently clear existing non-error visual accent
- stable alignment across rows
- marker itself decorative / `aria-hidden` or CSS pseudo-element
- original filename remains accessible text
- marker must remain visible with long Japanese/Latin filenames and max 10 rows
- do not make hover the only way to identify/read a file
- dot must not change primary action geometry

Prefer a small shared file-row structure, not source-specific duplication.

Target visual concept:

```text
●  Fund_Update_2026.pdf                     選択済み
●  DDQ.xlsx                                 保存済み
●  IC_Memo.docx                             再試行が必要
```

### Finding 3 — unrelated root AGENTS.md rewrite

PR #104 rewrites/condenses multiple root `AGENTS.md` sentences unrelated to Work0071.

This is not authorized by the Work scope and changes durable governance text without need.

Required repair:

- restore root `AGENTS.md` exactly to latest `origin/main`
- do not modify Core rules or repository rules in this PR
- Work0071 durable UX rule is already present on main and does not need rewording

### Finding 4 — distribution integrity was weakened

PR #104 removes the explicit pinned `sourceCommit / bundleSha256 / payloadSha256` BASIS from `scripts/build-company-multifile-package.cjs` and changes validation to trust whichever hashes are present in the release manifest.

That removes an independent accepted-release pin and weakens Work0023's distribution integrity contract.

Required repair:

- restore an explicit exact BASIS pin (or an equivalently strong independent assertion)
- do NOT merely accept arbitrary hashes because the release manifest is internally self-consistent
- final company package must be pinned to the exact final candidate source commit and exact bundle file/payload hashes
- release/source/hash mapping must remain externally reviewable
- tests must fail if release manifest hashes drift from the exact expected candidate

Do not weaken assertions to obtain a pass.

### Finding 5 — same release version currently identifies two different bundles

PR #104 changes source commit and bundle hashes while leaving `release_version=0.2.0`.

Work0070 already accepted release 0.2.0. A materially different user-facing bundle must not reuse the same release identity.

Required repair:

- Work0071 target release: `0.2.1`
- schema remains `9`
- update `KSP_RELEASE_VERSION` and generated release/install/package artifacts consistently
- no schema migration
- source commit/hash pin must refer to the exact final production-source candidate
- after production source is frozen, rebuild deterministic distribution once with the exact source commit, then pin the company multi-file BASIS to that manifest's exact source commit and hashes

Do not publish a GitHub Release or mutate company production in this Dispatch.

## Preserve Accepted CODEX-01 Evidence

Do not reopen findings already directly proven unless this repair can materially contradict them.

Accepted evidence to preserve:

- before geometry measurements
- Phase A action/status shell design
- Meeting / News / Assessment target-runtime representative saves
- 1440 / 390 geometry within criterion
- local 320 / 200% zoom / reduced-motion smoke
- Work0049 busy helper regression
- Work0070 retry/unknown-outcome contract
- 716/716 deterministic suite at CODEX-01 head

Rerun only the focused surfaces affected by this repair plus canonical check after the final source change.

## Scope

Allowed source changes should be limited to direct consequences of Findings 1–5.

Likely:

- `src/ClientPitchbookFiles.html`
- `src/ClientPitchbookFlow.html`
- `src/Styles.html`
- `src/00_Core.gs` for release 0.2.1
- focused tests
- bundle/package generation and exact integrity pins
- Work0071 report/dispatch docs

Do not add Phase B implementations.

## Phase B

Keep CODEX-01 Phase B findings as FOLLOW_UP:

- Activity Analytics focus continuity
- Master reorder focus continuity
- Past News/Assessment inline validation/focus
- Past Meeting/Pitchbook lifecycle focus restore

Do not fix them in CODEX-02.

## Focused Validation

Required:

### Standalone status consistency

- no-file submit -> correct primary error
- valid file selection -> obsolete primary error removed
- pending -> primary status truthfully indicates saving
- success -> primary success
- failure/retry -> no contradictory simultaneous state
- parent-bound Meeting material regression PASS

### File marker

For selected, pending, saved, partial/retry rows:

- marker visible before original filename
- same marker color across states
- marker is not used as status
- accessible filename remains intact
- marker decorative to assistive technology
- 1 / multiple / max 10 files
- long Japanese and Latin names
- 1440 / 390 / 320 CSS px
- no new material horizontal overflow
- primary action geometry remains within <=1 CSS px criterion

### Integrity / release

- release version 0.2.1 everywhere current generated distribution identifies the candidate
- schema9 unchanged
- exact source commit in release manifest
- exact bundle payload/file hashes recompute PASS
- company package has explicit independent candidate pin
- 7-file concatenation byte-identical to canonical bundle
- changing/tampering manifest hash in focused test causes validation failure

### Regression

- Work0049 focused busy regression
- Work0070 source/client regression directly coupled to changed files
- Work0071 stable interaction browser test
- generated bundle validation
- 7-file package parity
- `npm run check` once after focused tests
- `git diff --check`

## Target-runtime Requalification

New Dispatch authorizes one new bounded repair qualification cycle on the existing isolated owner-only target.

Budget:

```text
SOURCE_SYNC: max 1
IMMUTABLE_VERSION: max 1
EXISTING_DEPLOYMENT_UPDATE: max 1
NEW_DEPLOYMENT: 0
NEW_TARGET: 0
```

Use exact final repaired candidate.

Minimum actual Web App evidence:

1. standalone no-file error
2. native/synthetic valid file selection
3. stale primary error clears
4. vermilion marker visible before filename
5. submit -> primary pending status correct
6. success -> primary success
7. primary action/focus/scroll geometry within criterion at 1440
8. 390px marker/queue/action smoke
9. material console error/warn 0

If browser automation cannot perform file selection, return same Dispatch as `BALL: USER / STATUS: ACTION_REQUIRED`; do not classify as application defect.

Do not repeat migration/concurrency/provider qualification.

## Side-effect Boundary

Allowed:

- same isolated target source/version/deployment update within budget
- one tiny synthetic file save for the focused standalone path

Not allowed:

- company production
- company/confidential data
- provider/indexing/billing
- permission/access broadening
- schema/migration
- trigger changes
- physical delete
- destructive cleanup

AI sync remains disabled.

## Strategy Reset

Stop and return if:

- status repair requires changing retry/idempotency semantics
- release/integrity repair cannot preserve Work0023 hash contract
- marker causes material mobile/zoom regression after 2 distinct approaches
- source conflict occurs during latest-main reconciliation
- same runtime defect persists after the single authorized repaired deployment

Do not patch runtime source after qualification failure.

## Delivery

Continue existing branch / PR:

`work/0071-interaction-stability`  
Draft PR #104

Do not open a second PR.

Create:

`docs/handoffs/0071-CODEX-02-phase-a-repair-file-marker-report.md`

Update branch copy:

`docs/handoffs/0071-dispatches.md`

Do not mark Work0071 ACCEPTED or apply Completion Latch.

## Mandatory final identity

On normal return:

```text
WORK_ID: 0071
DISPATCH_ID: 0071-CODEX-02
BALL: CHATGPT
STATUS: RETURNED
```

If native file selection is required:

```text
WORK_ID: 0071
DISPATCH_ID: 0071-CODEX-02
BALL: USER
STATUS: ACTION_REQUIRED
```

WORK_ID: 0071
DISPATCH_ID: 0071-CODEX-02
BALL: CODEX
STATUS: READY
