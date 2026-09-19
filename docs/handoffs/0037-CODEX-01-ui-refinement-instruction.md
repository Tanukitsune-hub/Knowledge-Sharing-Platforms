# CODEX-01 — Implement frozen post-version11 UI refinements

WORK_ID: 0037
DISPATCH_ID: 0037-CODEX-01
BALL: CODEX
STATUS: READY
MODE: BUILD

## Authoritative contract

Read latest `origin/main`, root/nearest `AGENTS.md`, then:
- `docs/handoffs/0037-ui-refinement-requirements.md`
- `docs/planning/work0037-ui-refinement.md`
- `docs/handoffs/0037-dispatches.md`
- `docs/handoffs/0036-completion-report.md`

The frozen requirements file is authoritative for UI details. Do not broaden redesign beyond it.

## Baseline

```text
PRODUCTION_BASELINE: Work0036 / version11
MERGE_BASELINE: PR #58 / 9537b499ed05698ab1e981a51534fe86807d910d
OWNER_ONLY_DEPLOYMENT: preserve
SCHEMA8: preserve
AI_SYNC: disabled / preserve
WORK_0030: DEFERRED_BY_USER
```

## Primary Outcome

Implement all frozen Work0037 refinements in one coherent production update and qualify the same owner-only Web App end-to-end.

## Exact implementation requirements

### 1. 過去の記録

- Rename `Date From` -> `開始日`, `Date To` -> `終了日`.
- Add visible group label `対象期間` immediately above the two date controls.
- Compact left layout: 開始日 / 終了日 / Asset Class / Team aligned from left.
- Place Counterparty on the next row directly below the Start-date area.
- Hide Fund / Strategy from normal UI and send empty filter value.
- Hide Status from normal UI and ALWAYS send `Active` for normal Past Meetings search.
- Clear/reset must keep the hidden Status effective value as `Active`.
- Meeting Type remains visible/functional unless the frozen requirements say otherwise.

### 2. ナレッジ検索

- Detailed filters are always visible; remove collapsible behavior.
- Hide Fund / Strategy, Follow-up, Meeting Type and keep Equity/Debt hidden.
- Row 1: Start date / End date / All-period checkbox, compact left.
- Row 2: Counterparty wide (comparable to Past Meetings Counterparty width) / Asset Class / Team.
- Preserve existing `情報ソース` functionality because user did not request removal; place it compactly at Row2 right without reducing Counterparty priority width.
- Row 3 order: Search Mode -> `全文出力` immediately to its right -> AI model.
- Default Search Mode on initial load AND condition clear: `要約`.
- Row 4: rename label to exact text `AI検索 指示入力欄`; textarea full width.
- Row 5 left-aligned actions: primary `AI検索を実行`, secondary `条件クリア`.
- Rename existing `検索` to `AI検索を実行`.
- Preserve non-AI Full Output semantics; it remains usable without configured AI model.
- Hidden filters send no-filter defaults; backend contracts remain.

### 3. 面談実績の集計

- Make top controls compact/left-aligned; remove unnecessary horizontal gaps.
- Move `集計` action to left.
- Rename `期間` -> `期間粒度`.
- On initial bootstrap, initialize Start Date = End Date minus exactly 1 calendar year.
- Leap-day safe clamp to last valid day of target month.
- Do not keep recalculating Start Date after the user explicitly edits it; initialization only.
- Result section order must be: `選択した内訳` -> `該当Meeting` -> `集計サマリー`.
- Aggregation/service semantics unchanged.

### 4. プルダウンの管理

Replace combined master view with in-page tabs:
- `面談先`
- `Asset Class`
- `面談場所`
- `Team`

Behavior:
- initial tab `面談先`
- no page reload on tab switch
- clear active visual state
- refresh preserves selected tab
- only selected category add/list/edit UI is visible
- no `Equity / Debt` / `CAPITAL_TYPE` tab

面談先 tab:
- shared Work0036 new-Counterparty modal
- existing status/rename/deactivate/reactivate
- type may remain read-only in table, no inline type select

Option tabs:
- no Type selector
- Name + Add only
- send fixed backend type based on active tab
- keep rename/order/deactivate/reactivate

Use full-width content; remove the old side-by-side master panels.

### 5. 管理者ページ — remove in-app shared password gate

This is an explicit user-authorized product change.

Remove from active UI/product flow:
- shared admin password initialization
- password confirmation
- admin-mode unlock/start
- admin-mode lock/end
- password change
- locked/admin-mode status concept
- password-gate help copy

Behavior:
- once an already-authorized user reaches the owner-only Web App, Admin page settings are directly operable.
- controls disabled ONLY because of shared-password gate become available.
- controls disabled for provider state / qualification / feature policy remain correctly disabled.

Security boundary:
- DO NOT change deployment access.
- DO NOT broaden permissions.
- DO NOT make app public.
- keep same owner-only/authenticated Web App.

Cleanup:
- remove active shared-password gate/session code paths and obsolete UI handlers/tests.
- legacy password-related Script Properties may remain inert; do NOT physically delete them in this Work.
- do not expose hashes/secrets.

Note: Work0029 remains historical evidence; Work0037 intentionally supersedes its shared-password behavior in the current product.

### 6. 記録を追加 — compact vertical layout

Meeting Type:
- move from its dedicated row to Row1 right-side space.
- preserve existing Date/Time/Location/Team/Asset placements.
- use roughly columns 10–12 for Meeting Type.
- checkbox group may wrap inside that block at 1440/1280 but must not revert to a full-width dedicated row.

Register button:
- move from bottom action row to the right of `当社側`.
- align with the input control baseline/bottom.
- fit-content/compact, not full width.
- preserve submit/busy/validation/retry semantics.

Attachment:
- shorten desktop drop area to about 80–85% of attachment row.
- right-side 15–20% action column.
- stack `選択をクリア` then `未完了分を再試行` vertically.
- same row as drop area on desktop.
- mobile may stack under drop area.
- file/drop/retry/clear behavior unchanged.

Preserve notes textarea accepted height and visible status/result feedback.

## Shared visual constraints

- Work0036 12-column / 14px gap / width100% / max2000 / Light UI language.
- desktop qualification: 2560 / 1440 / 1280.
- mobile: 390 safe stack / no horizontal overflow.
- sidebar gold/3D/ornament unchanged unless a regression fix is necessary.

## Required focused tests

Add/update deterministic tests for at least:
- Past labels/grouping/layout + hidden Fund + forced Active payload/reset
- Knowledge always-visible filters, hidden unused filters, row structure, default mode `要約`, exact labels/button names, Full Output preserved
- Analytics compact layout, exact `期間粒度`, one-year bootstrap default incl leap clamp, user edit non-recalc, section order
- Masters tab IDs/labels, tab switching state, refresh state, fixed type payload, no CAPITAL_TYPE tab
- Admin shared-password UI 0, unlock/lock/password init/change active path 0, provider-specific disabled logic preserved
- owner-only deployment/security config unchanged
- Meeting-create Row1 Meeting Type, register-button placement, attachment actions layout, existing submit/file behavior
- responsive 2560/1440/1280/390 and no material overflow
- accepted Work0036 Counterparty modal unchanged
- Equity/Debt selection policy unchanged

Run:
- focused tests
- `npm run check`
- canonical bundle regeneration
- `npm run check:bundle`
- `git diff --check`

## Target runtime qualification

Use the SAME existing organization-controlled Apps Script project and SAME single owner-only versioned Web App.

Before mutation, independently read-only verify:
- Git/source baseline
- target identity
- saved source parity
- current immutable version parity
- existing single deployment
- execute-as/access remain owner-only

Then use the shortest safe mutation path:
- source sync max1 per coherent cycle
- immutable version max1 per coherent cycle
- same deployment update max1 per coherent cycle

Actual owner-only browser checks:
1. all 7 normal nav pages nonblank
2. 2560/1440/1280/390
3. Past Meetings exact labels/placement/hidden filters and Active-only search
4. Knowledge exact rows, default `要約`, exact `AI検索 指示入力欄`, Full Output placement/behavior, AI search button naming
5. Analytics default one-year period, left compact controls, section order
6. Masters four tabs, per-tab add/list/edit, refresh keeps tab
7. Admin page opens directly without password/unlock; permitted controls usable under owner-only boundary
8. Meeting-create compact Meeting Type / Register / attachment layout
9. existing Counterparty modal still works
10. console material error/warn0

Representative synthetic mutations are allowed only when required and must not use confidential data.

## Safety / Non-goals

```text
NEW_TARGET: 0
SECOND_DEPLOYMENT: 0
PERMISSION_BROADENING: 0
PUBLIC_EXPOSURE: 0
SCHEMA_CHANGE: 0
MIGRATION_CHANGE: 0
PROVIDER_TRANSITION: 0
CONFIDENTIAL_DATA: 0
PHYSICAL_DELETE: 0
WORK_0030: DEFERRED_BY_USER
```

Do not restart Work0035 UI Studio.

## Retry / Strategy Reset

Maximum 3 coherent repair/runtime cycles.

Strategy Reset and return early only if:
- same failure class repeats
- target/deployment identity mismatch
- owner-only boundary cannot be preserved
- requested result requires schema/migration/provider transition
- evidence becomes contaminated
- retry cap is exhausted

Ordinary CSS/HTML/JS/test defects are owned and repaired autonomously.

## Git delivery

Branch:
`codex/0037-ui-refinement`

Create exactly one Draft PR. Do not merge.

Report:
`docs/handoffs/0037-CODEX-01-ui-refinement-report.md`

Update branch dispatch/report state consistently.

## Return contract

When implementation + deterministic validation + target runtime qualification are complete:
```text
WORK_ID: 0037
DISPATCH_ID: 0037-CODEX-01
BALL: CHATGPT
STATUS: RETURNED
```

If a genuine native visual choice remains that cannot be resolved from the frozen requirements, return USER/ACTION_REQUIRED instead. Do not return for ordinary implementation defects.