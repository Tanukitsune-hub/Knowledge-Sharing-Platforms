# CODEX-24 — Pre-rollout UI polish + interactive regression repair

WORK_ID: 0028
DISPATCH_ID: 0028-CODEX-24
BALL: CODEX
STATUS: READY
MODE: BUILD

## Goal

会社PCへ移行する前に、ユーザー実機確認で見つかった5つのUI/interaction課題を同一Work内でまとめて修正し、owner-only actual Web Appで使える状態まで自律的に完成させる。

局所的なbugごとにChatGPTへ返さず、固定境界内でdiagnose -> minimal coherent repair -> tests -> same target runtime verificationを継続する。

## Start

Repository:
`Tanukitsune-hub/Knowledge-Sharing-Platforms`

Base:
latest `origin/main`

PR #51はmerged済み。新しいbranch / PRをlatest mainから作成する。
推奨branch:
`codex/0028-pre-rollout-ui-polish`

Read first:

- root + nearest `AGENTS.md`
- `docs/agent-governance/work-control.md`
- `docs/handoffs/0028-user-review-reopen.md`
- `docs/handoffs/0028-dispatches.md`
- `docs/planning/work-registry.md`
- final accepted report: `docs/handoffs/0028-CODEX-23-temporal-recovery-autonomous-completion-report.md`

Do not reopen unrelated accepted evidence.

## Required user outcomes

### A. Native calendar interaction

All relevant user-facing date inputs remain semantic `type=date`.

On the supported company target browser / Chrome path, clicking/focusing the date cell should make the native calendar picker readily available/open without requiring the user to hunt for an icon at the far edge.

Use native `showPicker()` only where supported and safe; preserve normal browser fallback. Do not build a custom calendar unless native behavior cannot meet the outcome.

Create/edit/date-range values must retain the existing canonical `YYYY-MM-DD` business-date contract.

### B. From/To default period

Every ordinary user-facing From/To date-range filter should initialize to:

- From = today's 3-years-prior anniversary
- To = today

Use Asia/Tokyo business-day semantics consistent with the existing Knowledge Search helper. Preserve the current Feb-29 -> Feb-28 fallback.

Knowledge Search already contains this behavior; do not duplicate divergent date math. Reuse/extract a shared helper if that is the smallest coherent design.

If an explicit “all period” mode exists, its behavior remains unchanged.

### C. 「記録を追加」が選択不能

Reproduce the current actual Web App issue first enough to identify the layer:
bootstrap/result/options, DOM disabled state, overlay/pointer layer, JS exception, event binding, or other actual cause.

Then repair the root cause.

Acceptance in actual owner-only runtime:
- Date/time controls usable.
- 面談場所 usable.
- 面談先区分 selection works.
- corresponding 面談先 options become selectable.
- Asset Class and other ordinary selects work.
- no blocking overlay/pointer capture.
- console has no material error.
- one new isolated synthetic Meeting can be registered through normal UI and read back correctly.

Do not use real/confidential data.

### D. Natural control widths

The attached user screenshot demonstrates the issue: on a wide viewport, Date/Time and dropdown controls occupy very long half-screen columns.

Implement a coherent responsive field-layout rule rather than one-off widths.

Design target:
- short user-facing input/select controls should normally cap around `30ch` (approximately half-width 30 characters).
- Date/Time may use a smaller intrinsic/semantic width.
- controls may be narrower or wider only when content/function genuinely warrants it.
- long text/textarea/file/record-body surfaces may remain wide.
- on narrow windows controls must shrink to available width (`max-width:100%`) with no horizontal scrolling caused by the form.
- apply consistently across normal user-facing forms and filters, including Meeting create/edit, Knowledge Search, Past Meetings and similar dropdown/filter rows.
- avoid destabilizing admin tables and specialized large surfaces.

Validate at a wide desktop viewport comparable to the supplied screenshot and at a narrow viewport.

### E. 「過去の記録」を面談先中心へ

Past Meetings user-facing UI should not expose GP as a parallel primary concept.

Required:
- remove the separate user-facing `関連GP` filter from Past Meetings.
- table heading becomes `面談先`, not `GP`.
- row primary identity is `counterpartyEntityName` (with legacy GP fallback only for old data).
- do not append `関連GP: ...` under the primary counterparty in the Past Meetings list.
- GP and non-GP records both search/render under the same counterparty concept.
- retain counterparty type + counterparty entity filtering if useful; these support all entity types and are not GP-only.
- keep Related_GP_IDs and related-GP backend/retrieval semantics intact. This is a UI/filter simplification, not a schema deletion.

## Existing date-range fact

`ClientKnowledgeSearch.html` already has `kSetDefaultKnowledgePeriod()` implementing 3-years-prior -> today. Treat this as existing accepted behavior, not new invention. Extend consistently to the other From/To surfaces.

## Autonomous authority / budget

Within this Work and safety boundary, decide implementation details yourself.

May:
- inspect/reproduce actual owner-only runtime
- modify production UI/CSS/client/server filtering code as necessary
- add focused UI/contract tests
- regenerate deterministic bundle
- use existing isolated target
- create immutable versions
- update the same single owner-only deployment
- execute synthetic runtime smoke
- use read-only subagent review if helpful

Budget:
- up to 3 coherent repair/runtime cycles
- same target only
- same single deployment only
- no parallel deployment
- do not return for ordinary JS/CSS/application failures; fix and continue

Return early only for:
- USER native OAuth/credential action
- permission/audience broadening
- real/confidential data requirement
- destructive/physical delete requirement
- architecture/schema change beyond this UI scope
- new target / second deployment requirement
- 3 cycles exhausted or same evidence-backed repair approach fails twice
- evidence contamination / unsafe rollback
- provider call / Work0030 requirement

## Fixed boundaries

```text
REAL_CONFIDENTIAL_DATA: 0
PHYSICAL_DELETE: 0
BROAD_ROLLOUT: 0
NEW_TARGET: 0
SECOND_PARALLEL_DEPLOYMENT: 0
DIRECT_OPENAI_CALLS: 0
GEMINI_CALLS: 0
AZURE_OPENAI_CALLS: 0
AI_SYNC: DISABLED
WORK_0030: DEFERRED_BY_USER
```

Do not alter the accepted Business Date/Time readback contract unless actual contradictory evidence requires it.

## Validation / Done when

Logic:
- focused tests for picker/default period/layout/Past Meetings rendering/filter simplification/interaction regression
- canonical `npm run check`
- `npm run check:bundle`
- `git diff --check`

Actual runtime:
1. Date click/focus gives usable native calendar interaction.
2. From/To defaults visible and correct on applicable filters.
3. 「記録を追加」 controls are actually selectable and synthetic registration succeeds.
4. wide desktop control widths look natural instead of stretching; narrow layout remains usable.
5. Past Meetings shows/searches GP + non-GP under `面談先`; no user-facing related-GP filter/list subline.
6. accepted Date/Time rendering remains correct.
7. provider0 / AI disabled / physical delete0 / confidential0.
8. no BLOCKER.

Produce before/after browser evidence for the affected user-facing surfaces. Do not store private URLs/account identifiers.

Report:
`docs/handoffs/0028-CODEX-24-pre-rollout-ui-polish-report.md`

Open a new Draft PR against main and update its body with Work/Dispatch/BALL/STATUS and acceptance evidence. Do not merge; ChatGPT owns final review/merge/Completion Latch.

Successful final response:

```text
WORK_ID: 0028
DISPATCH_ID: 0028-CODEX-24
BALL: CHATGPT
STATUS: RETURNED
```

If genuine user-native action is required:

```text
WORK_ID: 0028
DISPATCH_ID: 0028-CODEX-24
BALL: USER
STATUS: ACTION_REQUIRED
```

Recommended model: GPT-5.6 Sol / High, because this combines actual browser interaction diagnosis with multi-surface UI repair and final runtime verification.
