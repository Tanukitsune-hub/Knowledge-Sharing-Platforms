# Work 0035 CODEX-01 Multi-screen UI Studio 実行報告

## Dispatch

- `WORK_ID`: `0035`
- `DISPATCH_ID`: `0035-CODEX-01`
- `MODE`: `BUILD`
- `BRANCH`: `codex/0035-multi-screen-ui-studio`
- `DRAFT_PR`: `#57`
- `BASE_REF`: `origin/main@5bf938d4eb6a9d944bd1ed838d5a1592fe394291`
- `QUALIFIED_IMPLEMENTATION_HEAD`: `ac71ed3037d2233432f5b5243d904cea0a0e79cb`
- `STATUS`: `RETURNED / READY_FOR_CHATGPT_FINAL_REVIEW`

## Outcome

既存の`tools/ui-layout-lab/`を、Work 0034 / version 10をvisual baselineとするlocal-onlyのMulti-screen UI Studioへ拡張した。対象は次の7画面であり、1つのprojectとして保存・import・exportできる。

1. `knowledge` — ナレッジ検索
2. `meeting-create` — 記録を追加
3. `meeting-past` — 過去の記録
4. `counterparty-summary` — 面談先サマリー
5. `activity-analytics` — 面談実績の集計
6. `masters` — プルダウンの管理
7. `admin` — 管理者ページ

Work 0033のMeeting specVersion1/2、current authoritative candidate、既存localStorage variantは互換レイヤーとして残し、決定的に新projectへ移行する。旧ファイル`presets.js`、`layout-model.js`、`layout-lab.js`は破壊していない。

## Implemented surface

- Macro grid: `12 / 24 / 48 columns`
- Micro snap: `8 / 4 / 2 / 1px`
- Element properties: `order / colStart / colSpan / breakBefore / topGapPx / heightPx / xOffsetPx / yOffsetPx / widthAdjustPx / visible`
- direct pointer drag、8方向resize、alignment guides、drop ghost、row insertion marker
- 1 pointer gesture = 1 undo entry
- Inspectorとcanvasの同期、Arrow nudge、Shift+Arrow 4 steps
- section/cardとchild controlの2-level editing
- Overview、前後screen移動、screen別dirty marker
- Shared Shell settingsの7画面共通反映とscreen spec isolation
- Current Production v10 / Compact Institutional / Balanced Professional / Memo/Data Focus presets
- bounded history、screen reset、project reset
- project variantのlocalStorage保存・読込・削除
- current screen JSON / whole project JSON
- Meeting v1/v2 JSON / whole project JSON import
- current screen handoff / all-screen summary
- screen別local reference image overlay（tab memory only）
- Wide 2560 / Laptop 1440 / Compact 1280 / Mobile 390 preview
- Windows double-click launcherの名称更新

## Meeting candidate continuity

- accepted 12-column candidateを24-columnへexact変換して初期化した。
- `widthPercent: 100`
- `maxWidthPx: 2000`
- `align: left`
- `columnGapPx / rowGapPx: 14 / 14`
- `meeting-capitalTypeId`: hidden
- Row 1のvisual順はDate → Time → Location → Team → Asset Classを維持する。
- viewport preview切替はcanonical project JSONをmutationしない。

## Deterministic validation

- focused tests: `39/39 PASS`
  - 旧Layout Lab: `20/20 PASS`
  - Multi-screen UI Studio: `19/19 PASS`
- JavaScript syntax:
  - `node --check tools/ui-layout-lab/screen-definitions.js`: `PASS`
  - `node --check tools/ui-layout-lab/project-model.js`: `PASS`
  - `node --check tools/ui-layout-lab/studio.js`: `PASS`
- canonical validation: `npm run check` → `574/574 PASS`
- `git diff --check`: `PASS`
- seven baselines: `VALID / COLLISION_0`
- whole-project stable JSON exact roundtrip: `PASS`
- invalid import fail-closed: `PASS`
- Meeting v1/v2 deterministic migration: `PASS`
- 12↔24↔48 conversion: `PASS`
- 8/4/2/1px snap・offset bounds: `PASS`
- screen isolation / shared propagation / dirty state / history semantics: `PASS`
- local-only source audit: network request primitive `0`

## Repair cycles

- Cycle 1: focused testでJavaScriptのnegative-zero assertionとhandoff boundary文言の差を検出した。値のcanonicalizationと文言を限定修正し、focused testsを再実行して`35/35 PASS`とした。
- Cycle 2: USER file://確認でdrag後の座標ずれが観測された。CSS Gridのcolumn gapを無視した均等割り計算により右側ほどX誤差が累積し、別rowへのdragでは全Y差分がmicro offsetへ残ることを直接原因として特定した。実際のtrack + gap pitch、pointer grab offset、target row baseを使う計算へ限定修正し、gap-aware X reconstruction、12→24→48 coarse geometry、row insertion Y resetのregression testsを追加した。
- 使用済みcoherent repair cycles: `2 / 3`

## File runtime qualification

Chrome Browser Useで`file://`を直接開く操作はbrowser URL policyにより拒否された。迂回、raw CDP、別surfaceによる回避は行っていない。これは`AUTOMATION_TOOLING_LIMITATION`である。

USER actual file://確認ではdrag後の座標ずれが直接観測されたため、これはapplication defectとしてCycle 2で修正した。

2026-09-19、USERが修正版`ac71ed3037d2233432f5b5243d904cea0a0e79cb`について改訂checklistの確認完了を返した。これにより、次のactual file:// evidenceを受理した。

- 7画面とOverview: `PASS`
- Work 0033 Meeting candidate continuity: `PASS`
- direct drag / 8-direction resize / gap-aware coordinate alignment: `PASS`
- 48-column、4px、1pxまたは2px nudge、Inspector sync: `PASS`
- Shared Shell propagation / screen isolation / dirty marker / Undo / Redo: `PASS`
- project variant save/load / whole-project JSON roundtrip / handoff generation: `PASS`
- Wide / Laptop / Compact / Mobile / screen別reference overlay: `PASS`
- browser console material error/warn: `0`

## User file:// checklist

1. `tools/ui-layout-lab/open-layout-lab.bat`をdouble-clickする。
2. 左の7画面をすべて開き、Overviewの7 cardsも確認する。
3. 「記録を追加」がWork 0033 candidateを維持していることを確認する。
4. 少なくとも4画面でblockまたはchild controlを選択・編集する。
5. 1要素をdragし、別要素をcorner handleで縦横resizeする。
6. Macroを48 columnsへ切り替える。
7. Micro 4pxでArrow nudgeし、1pxまたは2pxでもnudgeする。
8. InspectorのX / Y / Width ±とcanvas表示が同期することを確認する。
9. Shared ShellのSidebarまたはRadiusを変え、別screen previewにも反映されることを確認する。
10. screen固有編集が他screenのplacementを変えないことを確認する。
11. Overviewのmodified markerを確認し、Undo / Redoを1回ずつ行う。
12. project variantを保存し、別変更後にloadして復元する。
13. Whole project JSONをcopyし、そのままimportして同じ状態へroundtripする。
14. Current screen handoffとProject summaryを生成する。
15. Wide / Laptop / Compact / Mobile、screen別reference overlay、console material error/warn 0を確認する。

## Scope and side effects

- `PRODUCTION_SRC_CHANGES`: `0`
- `DIST_CHANGES`: `0`
- `APPS_SCRIPT_DEPLOYMENT`: `0`
- `NETWORK_CALLS`: `0`
- `GOOGLE_CALLS`: `0`
- `PROVIDER_CALLS`: `0`
- `REAL_CONFIDENTIAL_DATA`: `0`
- `PHYSICAL_DELETE`: `0`
- `WORK_0030`: `DEFERRED_BY_USER`

## Completion state

- `LOGIC_VALIDATION`: `PASS`
- `DETERMINISTIC_UI_CONTRACT_VALIDATION`: `PASS`
- `ACTUAL_FILE_RUNTIME_QUALIFICATION`: `PASS / USER_CONFIRMED`
- `BLOCKER`: `NONE`
- `READY_FOR_CHATGPT_FINAL_REVIEW`: `YES`

## Shared Knowledge

- `KNOWLEDGE_RETRIEVAL`: `RULE-0001`
- `KNOWLEDGE_APPLIED`: `RULE-0001`
- `NEW_KNOWLEDGE_CANDIDATE`: `NO`
