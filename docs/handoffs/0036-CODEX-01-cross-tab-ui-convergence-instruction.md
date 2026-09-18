# CODEX-01 — Cross-tab production UI optimization

WORK_ID: 0036
DISPATCH_ID: 0036-CODEX-01
BALL: CODEX
STATUS: READY
MODE: BUILD

## Strategy Reset context

Work0035 Multi-screen UI Studio is SUPERSEDED_BY_USER. Do not implement or merge Work0035 editor expansion.

User wants verbal/direct UI refinement instead.

## Primary Outcome

Use Work0034/version10 production as baseline. Remove user-selectable Equity/Debt and Counterparty Type surfaces across the normal product, while preserving backend/schema/existing values. Then optimize all normal navigation tabs using the accepted Meeting-create layout language.

## Read first

- latest `origin/main`
- root + nearest `AGENTS.md`
- `docs/decisions/production-ui-cross-tab-convergence.md`
- `docs/planning/work0036-cross-tab-production-ui.md`
- `docs/handoffs/0034-completion-report.md`
- `docs/handoffs/0035-dispatches.md` (superseded context only)

## Closed conclusions

- production baseline: Work0034 / version10
- Meeting-create accepted topology is not redesigned
- shared sidebar gold/3D/ornament remains accepted
- page max-width 2000 remains accepted
- Work0035 tool expansion is abandoned
- Work0030 remains deferred

## A. Remove Equity / Debt selection surfaces

`Capital_Type_ID` remains in schema/backend/historical records.

Normal user must no longer see/select Equity / Debt.

Cover all visible/selectable surfaces, including at least:
- Knowledge Search detailed filter `knowledge-capitalTypeId`
- Meeting create (already hidden; preserve hidden compatibility)
- Past Meetings filter (already hidden; preserve)
- Meeting edit `meeting-edit-capitalTypeId`
- Pitchbook past filter `pitchbook-past-capitalTypeId`
- Pitchbook edit `pitchbook-edit-capitalTypeId`
- Pitchbook compatibility/create selector if it can ever become visible
- Option Master add-type `CAPITAL_TYPE` choice

Compatibility rules:
- search payload defaults capitalTypeId to empty when no UI selector
- existing record edit must preserve existing Capital_Type_ID rather than blanking it
- new Meeting/Pitchbook behavior must not require Capital Type
- do not delete CAPITAL_TYPE rows or schema columns
- do not migrate historical data

Update stale user-facing hints that mention Equity / Debt where the user no longer selects it.

## B. Remove Counterparty Type selection surfaces

`Counterparty_Type` remains backend metadata.

Remove normal filter/analytics selection of type, including at least:
- Activity Analytics `activity-filter-counterpartyType`
- Activity Analytics dimension option `counterpartyType` / 面談先種別
- native browser prompt based Counterparty type input
- Counterparty Master inline type selector
- any other visible normal-user Counterparty Type filter/select discovered during implementation

EXCEPTION: new Counterparty registration modal must expose a required Counterparty Type selector.

Already-hidden compatibility selects may remain hidden.

New Counterparty rule:
- no native browser `prompt()`
- open a dedicated custom modal
- type is REQUIRED and user-selected in that modal
- name is REQUIRED
- do NOT silently default to `OTHER`
- existing type unchanged

Counterparty Master existing type display column may remain read-only in this Work; do not make type editable.

## C. Common visual language

Reference: accepted Meeting-create screen.

Apply across normal tabs:
```text
desktop grid: 12 columns
column gap: 14px
row gap: 14px
normal control min/target height: ~37px
page width: 100%
max-width: 2000px
left aligned
```

Remove legacy field sizing like generic `30ch` / `17ch` caps where it creates awkward empty space. Explicit exceptions are allowed for naturally short controls only when visually intentional.

Keep controls aligned to grid cells. Keep card rhythm consistent.

Desktop 2560 / 1440 / 1280 should retain coherent topology. <=720px may stack to one column.

## D. Per-tab layout targets

### D1. Knowledge Search

Use explicit 12-column layout.

Row 1:
- 面談先 start1 span4
- 情報ソース start5 span2
- 開始日 start7 span2
- 終了日 start9 span2
- 全期間 start11 span2

Row 2:
- 検索モード start1 span3
- AIモデル start4 span3

Question/instruction textarea: full width 12.

Detailed filters:
- Asset Class span2
- Team span2
- Fund / Strategy span4
- 要フォロー span2
- Meeting Type span2
- no Equity/Debt

Export/result cards remain full-width and aligned.

### D2. Meeting Create

Do not change accepted Work0034 topology except fixes required to protect it from shared CSS changes.

### D3. Past Meetings / maintenance

Keep Work0034 filter baseline.

Make detail/edit sections follow Meeting-create spacing/width.

Meeting edit desired structure:
- Date start1 span2
- Time start3 span1
- Location start4 span2
- Team start6 span2
- Asset Class start8 span2
- Counterparty next row span6
- Fund / Strategy same row span4
- Meeting Type full row
- Counterparty participants span6
- Internal participants span6
- follow-up controls may remain because user did not request global removal from edit
- Notes full width

Equity/Debt hidden/preserved.

Pitchbook past/edit nested surfaces also receive aligned 12-column sizing and no Equity/Debt visible selector.

### D4. Counterparty Summary

- selector aligned left, about 6/12 width desktop
- summary cards same height/rhythm
- Fund/Strategy selector ~6/12
- main tables full-width
- paired content sections 6/6 desktop
- mobile stack

Do not reintroduce Counterparty Type selector/presentation removed in Work0034.

### D5. Activity Analytics

12-column filters.

Row 1:
- Period 2
- Start 2
- End 2
- Dimension 2
- Counterparty 4

Row 2:
- Asset Class 2
- Team 2
- Meeting Type 3
- Status 2

No Counterparty Type filter.
No Counterparty Type dimension option.

Charts/tables full-width. Align headline/stat cards consistently.

Backend counterpartyType analytics support may remain unused for compatibility.

### D6. Masters

Desktop main sections: 6/6.

Counterparty add flow:
- remove inline type selector from the Masters page
- show a compact `新規面談先を追加` action/button
- open the same dedicated Counterparty registration modal used by Meeting-create quick-add
- modal contains required Type select + required Counterparty name
- do not default to `OTHER`

Option add form:
- no `CAPITAL_TYPE` option
- preserve Asset Class / Location / Team

Do not delete existing type/capital metadata.

### D7. Admin

Organize provider/admin cards with the same 12-column / 14px rhythm.

Do not stretch short config fields across 2000px unnecessarily. Use logical 3/4/6-column widths and aligned rows.

No provider/security behavior change.

## E. Detail/read-only presentation

The user explicitly asked to remove selection fields. Do not opportunistically remove historical metadata from backend or documents.

If an Equity/Debt or Counterparty Type value is read-only and not a selection control, preserve it unless removing it is necessary for visual consistency and clearly presentation-only. Avoid widening scope.

## F. Validation

Add focused tests for:
- zero visible/selectable Equity/Debt controls in normal UI
- no `CAPITAL_TYPE` in Option Master add selector
- hidden/preserved edit capital values survive update
- zero Counterparty Type selectors in filters/analytics; the only allowed user-selectable type surface is the new-Counterparty modal
- new Counterparty modal requires explicit valid type selection
- legacy existing type preserved
- Knowledge 12-col layout
- Past/Edit layouts
- Counterparty Summary layout
- Analytics layout
- Masters layout
- Admin layout
- Meeting-create accepted topology unchanged
- 2560/1440/1280/390 no material overflow

Run:
- focused tests
- `npm run check`
- canonical bundle regeneration
- `npm run check:bundle`
- `git diff --check`

## G. Runtime qualification

Use same existing organization-controlled owner-only Apps Script target and same single deployment.

Read-only identity/deployment/source parity preflight before mutation.

Actual owner-only Web App checks:
- all 7 normal nav tabs non-blank
- layouts at 2560 / 1440 / 1280
- mobile 390 safe
- Meeting-create unchanged/regression-free
- Knowledge Search controls/layout
- Past Meeting search/detail/edit
- Analytics filters/result render
- Counterparty Summary render
- Meeting-create quick-add opens custom modal (no native prompt), registers selected type + name, then selects the new Counterparty
- Masters new-Counterparty action opens the same custom modal and refreshes the master list
- Option add no Equity/Debt choice
- Admin page layout
- console material error/warn0

Representative synthetic mutation may be used only where necessary. No confidential data.

## Safety / mutation budget

```text
SCHEMA_CHANGE: 0
MIGRATION_CHANGE: 0
NEW_TARGET: 0
SECOND_DEPLOYMENT: 0
PERMISSION_BROADENING: 0
PROVIDER_CALLS: 0
AI_SYNC: DISABLED / UNCHANGED
CONFIDENTIAL_DATA: 0
PHYSICAL_DELETE: 0
WORK_0030: DEFERRED_BY_USER
```

Max 3 coherent repair/runtime cycles.

## Git / delivery

Branch:
`codex/0036-cross-tab-ui-convergence`

Create one Draft PR. Do not merge.

Report:
`docs/handoffs/0036-CODEX-01-cross-tab-ui-convergence-report.md`

Update Work Registry / dispatch docs on branch as appropriate, but main controller state remains authoritative until final review.

## Autonomous completion

Own implementation, debugging, test repair, bundle regeneration, deployment and runtime qualification within scope.

Do not return for ordinary CSS/HTML/JS/test failures.

Return:
```text
WORK_ID: 0036
DISPATCH_ID: 0036-CODEX-01
BALL: CHATGPT
STATUS: RETURNED
```

Only return USER/ACTION_REQUIRED if a native visual decision truly cannot be resolved from this contract.
## B2. Dedicated New Counterparty modal — latest user instruction

This latest instruction supersedes the earlier `default OTHER / no type choice` rule.

Replace the current quick-add/native prompt behavior with a real in-app modal dialog.

### Entry points

1. Meeting-create `未登録の面談先を追加`
2. Masters / 面談先マスター `新規面談先を追加`

Both entry points should reuse the same modal component and submit flow.

### Modal UI

Centered dialog over a dimmed backdrop. Do not use `window.prompt`, `alert`, or browser-native prompt UI.

Fields:
- Label: `面談先種別`
  - required `<select>`
  - first option `選択してください` / empty value
  - options:
    - `GP` / `GP / 運用会社`
    - `LP_ASSET_OWNER` / `LP / Asset Owner`
    - `NISSAY_INTERNAL` / `日本生命`
    - `GROUP_COMPANY` / `グループ会社`
    - `CONSULTANT_GATEKEEPER` / `Consultant / Gatekeeper`
    - `OTHER` / `その他`
- Label: `面談先名`
  - required text input
  - existing max length / validation contract

Actions:
- secondary `キャンセル`
- primary `登録`

Validation:
- empty type => inline modal error, no server call
- empty/whitespace name => inline modal error, no server call
- service duplicate/validation error => display in modal and keep entered values

### Interaction / accessibility

- `role="dialog"` and `aria-modal="true"`
- focus first useful field on open
- keep keyboard focus within modal while open
- Escape closes without mutation
- Cancel closes without mutation
- backdrop click may close only if it cannot cause accidental submit
- after close, restore focus to trigger
- background page interaction/scroll should not interfere while open

### Success behavior

Meeting-create origin:
- refresh Counterparty options
- select the newly created Counterparty automatically
- close modal
- no page reload

Masters origin:
- refresh Counterparty master list/options
- close modal
- no page reload

Type is stored exactly from the selected enum. Existing backend quick-add/master service may be reused or minimally converged; do not change schema.

### Visual language

Use current Light UI + restrained gold accent:
- white/surface dialog
- gold-accent header/border or primary emphasis
- same 37px-ish control height
- compact, not full-page
- desktop comfortable width roughly 420–520px
- mobile width within viewport with safe margins

### Tests

Add focused tests for:
- no native prompt call for Counterparty registration
- exactly one reusable modal workflow/component
- all six type options
- explicit type required
- name required
- Meeting origin auto-selects new Counterparty
- Masters origin refreshes list
- Escape/Cancel no mutation
- service error remains in modal

Actual runtime qualification must include opening the modal from both entry points and one synthetic creation with a non-default type.