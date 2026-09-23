# Work 0050 — Theme Color Tool implementation plan

WORK_ID: 0050
STATUS: ACCEPTED
MODE: BUILD
BASELINE: Work0049 version31
ACTIVE_DISPATCH: NONE
BALL: NONE

## Primary Outcome

Theme Settingsへ、色探索 -> HEX/RGB確認 -> Theme tokenへ適用 -> existing live preview/save までを一続きにしたColor Toolを追加する。

## UX architecture

Theme Settings layout:

1. カラー調整ツール
2. 既存16色設定
3. existing Save / Discard / Reset

Color Tool:
- saturation/value 2D picker
- hue slider
- current swatch
- HEX
- RGB
- copy
- target token select
- Apply
- optional Eyedropper

## State architecture

Existing:
`themeSettingsState`
`themeSettingsDraft`

Add lightweight client-only:
`themeColorToolState`

Suggested:
```js
{
  activeKey: 'sidebar.background',
  currentHex: '#2D3E49',
  hue: ...,
  saturation: ...,
  value: ...
}
```

No new persistence object.

## Fastest Safe Decisive Action

Work0049 accepted後:
1. latest main / Theme Settings accepted behavior確認。
2. color conversion helpers unit tests。
3. Color Tool client-only state + UI実装。
4. existing 16-field draftへbridge。
5. clipboard + Eyedropper progressive enhancement。
6. responsive / keyboard tests。
7. existing Theme Save/Discard/Reset regression。
8. bundle / runtime qualification。
9. same owner-only Web Appへbounded deploy。
10. ChatGPT final review。

## Expected production scope

Likely:
- `src/AiProviderSettingsPage.html`
- `src/ClientThemeSettings.html`
- `src/Styles.html`

Server/backend changes are not expected.

## Routing

Route C予定。

Recommended model:
- GPT-5.6 Sol High

Reason:
color conversion / pointer interaction / accessibility / existing Theme Settings state integrationを同時に扱うため。

## Deployment target

Work0049 accepted served versionをbaselineに、next immutable version 1つ。

## Safety

```text
THEME_PERSISTENCE_SCHEMA_CHANGE: 0
SERVER_THEME_STORAGE_CHANGE: 0
SCHEMA_CHANGE: 0
MIGRATION_CHANGE: 0
PROVIDER_CHANGE: 0
PERMISSION_CHANGE: 0
NETWORK_DEPENDENCY: 0
WORK_0030: DEFERRED_BY_USER
```


## Accepted Outcome

Work0050 completed in PR #72 with target-runtime qualification on version32.
Completion Latch applied. No further Work0050 action is required unless a material regression is found.
