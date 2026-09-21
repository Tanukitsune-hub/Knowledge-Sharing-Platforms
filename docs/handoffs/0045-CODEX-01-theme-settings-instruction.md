# Work 0045 CODEX-01 — shared runtime theme settings

WORK_ID: 0045
DISPATCH_ID: 0045-CODEX-01
BALL: CODEX
STATUS: READY
MODE: BUILD

## Primary Outcome

Work0044 version25でユーザー確定済みのpaletteをexact defaultとして維持しつつ、管理者ページに`テーマ設定`tabを追加し、基本16色をlive preview / shared save / discard / default resetできるようにする。

## Recommended model

GPT-5.6 Luna Max。

理由: UX / storage / security boundary / acceptance contractはGitHubで固定済み。残作業はcross-file implementationとruntime qualificationが中心。

## Read first

- `docs/handoffs/0045-theme-settings-requirements.md`
- `docs/planning/work0045-theme-settings.md`
- `docs/design/0045/theme-settings-spec.md`
- `docs/design/theme-palette-registry.md`
- `docs/design/theme-palette-tokens.json`
- `docs/handoffs/0044-completion-report.md`
- `docs/handoffs/0044-CODEX-01-theme-tuning-report.md`

## Non-negotiable behavior

Admin tabs:
```text
AIプロバイダ設定 | 削除記録の管理 | テーマ設定
```

Default selected tab remains AI provider.

Theme UI:
- exact 16 basic colors
- color picker + HEX
- live preview
- 保存
- 変更を破棄
- 既定の配色に戻す
- invalid HEX protection
- contrast warning

Persistence:
- `PropertiesService.getScriptProperties()`
- key `KSP_THEME_SETTINGS_V1`
- one validated JSON
- no UserProperties
- no localStorage persisted theme
- no new Sheet

Initial render:
- server-inject validated theme CSS variables before body paint
- normal Index + standalone Knowledge Search
- no async theme flash

Reset:
- delete runtime override
- fallback to Work0044 exact source default

## Critical default-fidelity rule

Before implementing runtime overrides, prove that the CSS-token refactor by itself keeps Work0044 version25 computed palette unchanged.

Do not accept “visually similar” as default fidelity. Core accepted values in the registry must remain exact.

## Runtime qualification

Same existing owner-only Web App only. No access change.

Expected final served version: 26.

For live persistence proof, do NOT save a visibly different production theme:
1. save exact current Work0044 default 16 values
2. reload/fresh page and prove persisted initial render
3. reset to default
4. prove Script Property absent
5. reload and prove identical Work0044 palette

Unsaved preview may temporarily change a color in the current browser to prove preview/discard.

Final state:
```text
KSP_THEME_SETTINGS_V1: ABSENT
VISIBLE_THEME: WORK0044_DEFAULT
```

Because current deployment is ACCESS: MYSELF, do not claim actual second-user qualification and do not broaden access. Prove shared script-scope storage structurally + fresh-load persistence.

## Validation

Required:
- focused Work0045 tests
- `npm run check`
- bundle regeneration
- `npm run check:bundle`
- `git diff --check`
- browser test for 3 admin tabs / 16 fields / preview / discard / validation
- unit tests for property normalization / corruption fail-safe
- runtime 7 pages × 2560 / 1440 / 1280 / 390
- representative dynamic states
- console material error/warn 0
- provider calls 0

## Hard safety boundary

```text
NEW_SHEET: 0
SCHEMA_CHANGE: 0
MIGRATION_CHANGE: 0
TRIGGER_CHANGE: 0
PROVIDER_CALLS: 0
AI_SYNC_CHANGE: 0
RECORD_MUTATION: 0
FILE_MUTATION: 0
PERMISSION_BROADENING: 0
PUBLIC_EXPOSURE: 0
WORK_0030: DEFERRED_BY_USER
```

If these become necessary, STOP and RETURN rather than broadening scope.

## Delivery

Branch:
`codex/0045-shared-theme-settings`

Draft PR, do not merge.

Report:
`docs/handoffs/0045-CODEX-01-theme-settings-report.md`

Update:
`docs/handoffs/0045-dispatches.md`

Report must include:
- baseline / final application head
- exact production files changed
- 16 default tokens and computed fidelity
- storage key / saved JSON shape (without private data)
- preview/discard evidence
- persistence save/reload/reset evidence
- final property state
- initial-render/no-flash evidence
- admin tab keyboard evidence
- tests/bundle/runtime
- permission/access unchanged
- multi-user qualification limitation
- BLOCKER / READY_FOR_CHATGPT_FINAL_REVIEW

WORK_ID: 0045
DISPATCH_ID: 0045-CODEX-01
BALL: CODEX
STATUS: READY
