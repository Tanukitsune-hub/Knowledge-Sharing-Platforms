# Work 0045 — shared runtime theme settings requirements

WORK_ID: 0045
STATUS: ACCEPTED
MODE: BUILD
PHASE: COMPLETE
BALL: NONE
ACTIVE_DISPATCH: NONE

## Baseline

```text
BASELINE_PRODUCT: Work0044
FINAL_SERVED_VERSION: 25
WORK_0044: ACCEPTED
WORK_0030: DEFERRED_BY_USER
```

## Primary Outcome

Work0044でユーザーが確定したExecutive Navy Slate paletteをexact defaultとして維持しながら、管理者ページから基本16色をコード変更・再deployなしで調整、preview、共有保存、破棄、既定復元できるようにする。

保存済みthemeはbrowser-localではなくscript-level shared runtime configurationとして保持し、後続page loadは同じsaved themeを初期描画時から利用する。

## Closed decisions

- 管理者ページへ3つ目のtab `テーマ設定` を追加。
- 既存default tabは `AIプロバイダ設定` のまま。
- editable colorsは `docs/design/theme-palette-tokens.json` のbasic 16項目。
- Work0044 accepted paletteがimmutable source default。
- persisted overrideはScript Propertiesのsingle JSON。
- key: `KSP_THEME_SETTINGS_V1`。
- new Spreadsheet sheet / schema migrationは作らない。
- localStorage / UserPropertiesへpersistしない。
- `保存` / `変更を破棄` / `既定の配色に戻す` を用意。
- color picker + HEX input + live preview。
- derived colorsはuser-facing設定に増やさず、内部でdeterministicに追従。
- malformed HEXはreject。low contrastはwarning。
- runtime overrideはinitial server renderへ注入し、theme flashを避ける。
- current deployment accessはMYSELFのまま。permission broaden 0。
- Work0030は触らない。

## Authoritative default palette

- `docs/design/theme-palette-registry.md`
- `docs/design/theme-palette-tokens.json`
- `docs/handoffs/0044-completion-report.md`

No override state must exactly reproduce version25 accepted computed palette.

## Persistence contract

Persisted JSON:
```json
{
  "schemaVersion": 1,
  "palette": {
    "...exact 16 keys...": "#RRGGBB"
  },
  "updatedAt": "ISO-8601"
}
```

Rules:
- complete 16-key palette
- `#RRGGBB` only
- uppercase normalize
- unknown keys rejected
- malformed/corrupt property fail-safe to Work0044 defaults
- no secrets / identity / private IDs
- reset deletes the property and falls back to source default

## Theme engine

Introduce explicit CSS custom-property mapping for the 16 editable roles and required derived roles.

Hard requirement:
- source default values render identical to Work0044 accepted version25
- runtime override only changes color, never layout / geometry / content / behavior
- derived token logic is deterministic
- all main surfaces and sidebar roles currently covered by Work0044 palette participate
- warning/destructive semantic roles remain identifiable

## Initial render

Server template evaluation must load validated script-level theme and inject CSS custom-property declarations before body paint.

Required routes:
- normal Index route
- standalone Knowledge Search route

Do not use an asynchronous post-paint RPC as the primary theme application path.

## Admin UI

Third tab:
`テーマ設定`

Fields:
- 16 editable colors grouped Sidebar / Main / Text / Action / State
- swatch/color picker
- HEX field
- default value hint
- current saved/default state

Actions:
- 保存
- 変更を破棄
- 既定の配色に戻す

Statuses:
- 未保存のプレビュー
- 保存しました
- 既定の配色に戻しました
- validation / contrast warning

Keyboard tab navigation must expand existing admin tab loop from 2 to 3 without regressing ArrowLeft/ArrowRight/Home/End behavior.

## Safety / security

- Theme read is non-secret.
- Theme mutation remains inside current owner-only deployment/admin surface.
- No permission broadening.
- No new public endpoint.
- CSS injection protection: server accepts only exact known keys and validated HEX.
- Do not persist arbitrary CSS text.
- No provider calls.
- No AI sync.
- No record/file mutation.
- No schema/migration.
- No new trigger.

## Cross-user semantics

Storage must be Script Properties, not UserProperties/localStorage, so the saved override is shared at script level.

Important current limitation:
- actual different-user browser qualification is impossible while deployment access is MYSELF.
- Work0045 must verify script-scope persistence and fresh-load persistence without broadening access.
- future multi-user rollout must separately re-review admin mutation authorization.

## Acceptance Evidence

### A. Work0044 default fidelity

With `KSP_THEME_SETTINGS_V1` absent:
- all 16 default values equal registry
- Work0044 representative computed colors match version25
- screenshot/layout regression absent

### B. UI

- admin tabs = exactly 3
- default = provider
- theme tab accessible by click + keyboard
- all 16 settings present exactly once
- picker ↔ HEX synchronization
- invalid HEX blocks save
- low contrast warning observable

### C. Preview / discard

Use an unsaved temporary palette change:
- computed CSS changes immediately
- `未保存のプレビュー` visible
- Script Properties unchanged
- `変更を破棄` returns exact persisted/default computed value

### D. Shared persistence roundtrip

To avoid visual drift in live owner-only target:
1. save all 16 current Work0044 default values as runtime override
2. confirm script property exists
3. fresh reload/new browser page reads same values during initial render
4. no post-paint color jump
5. reset to default
6. confirm property removed
7. fresh reload still renders exact Work0044 palette

This proves persistence without leaving production visually altered.

### E. Corruption fail-safe

Automated/mocked:
- invalid JSON
- missing key
- unknown key
- invalid HEX
must fall back/reject safely as specified, with no arbitrary CSS emission.

Do not corrupt actual production Script Properties for this test.

### F. Runtime regression

Same existing owner-only Web App:
- all 7 normal pages nonblank
- 2560 / 1440 / 1280 / 390
- representative dynamic states
- sidebar height Work0044 behavior preserved
- console material error/warn 0
- provider calls 0

### G. Side effects

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
EXPECTED_CONFIG_MUTATION: KSP_THEME_SETTINGS_V1 save/reset qualification only
FINAL_THEME_OVERRIDE_STATE: ABSENT
WORK_0030: DEFERRED_BY_USER
```

## Completion

Done only when:
- version25 palette exact default is preserved
- theme admin flow works end-to-end
- shared Script Properties persistence is proven
- final runtime override is removed
- no visual/layout regression
- BLOCKER NONE
