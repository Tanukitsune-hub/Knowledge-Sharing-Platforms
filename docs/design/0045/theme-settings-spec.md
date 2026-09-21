# Work 0045 — Theme Settings UI / persistence reference

WORK_ID: 0045

## Visual / interaction target

既存の管理者ページに3つ目のtab `テーマ設定` を追加する。

```text
AIプロバイダ設定 | 削除記録の管理 | テーマ設定
```

既存2 tabのlayout / behavior / default selected tabは維持する。

Theme panelは既存Work0044のcard / section / action component languageをそのまま使い、新しいvisual systemを作らない。

## Basic 16 editable colors

Authoritative default:
- `docs/design/theme-palette-registry.md`
- `docs/design/theme-palette-tokens.json`

Each row:
- Japanese label
- color swatch / `input[type=color]`
- HEX input
- accepted default HEX
- short color name

Groups:
1. Sidebar (5)
2. Main (4)
3. Text (2)
4. Action (2)
5. State (3)

## Controls

- `保存`: current 16 valuesをshared runtime overrideとして保存
- `変更を破棄`: unsaved previewを破棄し、現在persistされているthemeへ戻す
- `既定の配色に戻す`: confirmation後、runtime overrideを削除しWork0044 accepted defaultへ戻す

## Preview

color picker / HEX入力はcurrent browserへ即時previewする。

Unsaved preview:
- serverへ保存しない
- page navigationしても同じtab内sessionではpreviewを維持してよい
- reload / discardでpersisted themeへ戻る
- visible `未保存のプレビュー` statusを出す

## Validation

- accepted format: `#RRGGBB` only
- case-insensitive input,保存時uppercase normalize
- unknown keys / CSS fragments / arbitrary strings reject
- critical contrast pairsをclientで計算し、低contrast時はwarningを表示
- warningは保存を自動拒否しない
- malformed valueは保存不可

Critical pairs:
- Sidebar text / Sidebar background
- Main text / Page background
- Main text / Card background
- Main text / Section header
- white text / Primary button

## Runtime inheritance

```text
Work0044 accepted defaults in source
  ↓
Script Properties runtime override (if valid)
  ↓
server-rendered CSS custom properties before body paint
  ↓
all app surfaces
```

No localStorage / UserProperties for persisted theme.

## Shared persistence

Script property key:
`KSP_THEME_SETTINGS_V1`

Stored object:
- schemaVersion: 1
- palette: complete 16-key normalized map
- updatedAt: ISO string

Do not store user identity or other PII.

## No-flash requirement

Index / standalone Knowledge Search route both receive validated runtime CSS variables during server template evaluation, before body rendering.

A normal page load must not:
1. paint Work0044 defaults,
2. wait for RPC,
3. then switch to override.

Runtime override must be present in initial HTML style variables.

## Default fidelity

When no runtime override exists, computed colors must equal Work0044 version25 accepted palette.

Reset must remove the override rather than copying a second divergent default into storage.

## Current security boundary

Current deployment remains:
- WEB_APP
- execute as USER_DEPLOYING
- ACCESS: MYSELF

Work0045 does not broaden access or introduce a new user-role model.

The persistence mechanism is script-scoped and therefore structurally shared rather than browser/user scoped. Actual second-user qualification is not possible while ACCESS remains MYSELF. Before a future multi-user rollout, administrator mutation authorization must be re-reviewed; this Work must not claim that multi-user authorization was qualified.
