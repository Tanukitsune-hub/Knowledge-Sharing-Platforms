# CODEX-02 — Direct manipulation / fine placement enhancement report

WORK_ID: 0033
DISPATCH_ID: 0033-CODEX-02
BALL: CHATGPT
STATUS: RETURNED
MODE: BUILD

## Work Contract

- Primary outcome: accepted CODEX-01 Layout Labを、canvas上でrow・start column・幅・高さを直接調整できるspecVersion2 visual editorへ強化する。
- Evidence hierarchy: USERによるChrome `file://` actual interaction / rendered state / console、共有pure modelのfocused tests、repository canonical tests、source inspectionの順。
- Required scope: `tools/ui-layout-lab/`、focused tests、本report、Dispatch control、既存Draft PR #55のみ。
- Non-goals: production `src/`、Apps Script bundle/deployment、backend/schema/migration、provider、Work 0030。
- Side-effect boundary: network / Google / provider / confidential data / production mutationすべて0。
- Collision policy: overlapを保存せず、previewで明示したうえで衝突fieldを次rowへdeterministic pushする。
- Repair budget: 最大3 coherent cycles。deterministic completionまで`1/3`を使用。繰り返すapplication failureはない。

## Implementation

Implementation commits: direct-manipulation v2 `3a21af3`、revised authoritative candidate `c6e15fc`、current max-width convergence `1abfb3e`。

### Revised authoritative candidate

- latest `origin/main`の`docs/handoffs/0033-user-layout-candidate-current.json`を正本として取り込んだ。旧77% / 24-column candidateは`SUPERSEDED`でありpreferred stateとして使用しない。
- 初期状態、`Compact Institutional` preset、Resetをcurrent 12-column candidateへ統一した。
- containerはwidth 100% / max-width 2000px / left / gap 14px・14px。前candidateの1680pxは`SUPERSEDED`。
- JSON array順と視覚順を分離し、rendererは各visible fieldへexplicit `gridColumn` / `gridRow`を設定する。Row 1は必ずDate → Time → Location → Team → Asset Classとなる。
- `meeting-capitalTypeId`はhiddenで、visible row calculationとgrid spaceを消費しない。
- preview viewportをcanonical layout/historyから分離した。Wide / Laptop / Compact / Mobile切替はcanonical JSON、placement、dirty state、undo historyを変更しない。
- Wide / Laptop / Compactは同じ12-column topology、MobileだけがCSSによる1-column visual projectionとなる。
- Codex handoffへsupplement指定のresponsive intent全文を出力する。

### Direct manipulation

- selected fieldにN / S / E / W / NE / NW / SE / SWの8 handleを表示する。
- pointer capture中はDOM上でlive previewし、start / span / height / top gap badgeを表示する。`pointerup`だけが1 history entryをcommitし、`pointercancel`は元stateへ戻す。
- 通常field、participant/group、notes、attachmentへrole別safe height rangeを適用した。
- W/N resizeは可能な範囲で反対edgeを保持する。gridまたはsafe range境界ではclampを明示する。
- field dragはpointerのx/yからorder、row insertion、`colStart`、`breakBefore`を算出し、意図的な水平gapを保持する。
- drop ghost、new-row marker、target edge、近接field edge、container center guide、collision / boundary stateを表示する。

### Placement model / precision

- canonical schemaを`specVersion: 2`へ昇格した。
- fieldへ`order`、`colStart`、`colSpan`、`breakBefore`、`topGapPx`、`heightPx`を常設した。
- containerへ`gridColumns`を追加し、Standard 12 / Fine 24を切り替え可能にした。
- 12→24はstart/spanをexact 2倍変換する。24→12はnearest safe placementへnormalizeし、奇数unitによるfidelity lossをUI messageとlintで明示する。
- mobile previewはdesktop specを変更せず1-column表示を維持する。

### Inspector / nudge / compatibility

- inspectorへorder、start、span、top gap、height、row breakを追加し、mouse結果と同じcanonical stateを編集する。
- canvas focus中のArrow Left/Rightでstartを1 unit、Arrow Up/Downでorderを1 step動かす。Shiftはlarger stepで、input/select/textarea/buttonとresize handle keyboard操作は奪わない。
- specVersion1 JSONはvalidate後に決定的にv2へmigrateする。
- 既存のv1 keyを維持したままlocalStorage variantをload時にin-place v2 migrationし、invalid variantも削除しない。
- 4 presets、hide/show、viewport、整える/lint、undo/redo/reset、variant、JSON、Codex handoff、reference overlay、Windows launcherを維持した。

## Evidence mapping

| Requirement | Deterministic evidence |
|---|---|
| spec v1→v2 / local variant migration | focused migration + preservation tests PASS |
| v2 validation / stable JSON | invalid property fail-closed + exact roundtrip PASS |
| 12↔24 precision | exact 12→24/even roundtrip + odd-unit safe 24→12 PASS |
| direct placement / intentional gap | order / start / row-break model tests PASS |
| collision policy | collision detection + next-row deterministic resolution PASS |
| 8-direction resize | N/S/E/W/4 corners math and bounds PASS |
| all-field vertical resize | ordinary + notes role min/max tests PASS |
| one gesture / history | multiple previews + single record = one undo entry PASS |
| v2 tidy/lint | collision/bounds/gaps/tall/narrow/short/precision warnings PASS |
| accepted baseline | four presets, stable IDs, Current v8 values, hidden/history features PASS |
| revised candidate parity | latest `origin/main` candidateとのnormalized semantic parity PASS |
| explicit visual topology | Row 1 visual order、Rows 2-7、intentional blanks、hidden no-slot PASS |
| viewport non-mutation | preview stateをcanonical/historyから分離、button handler non-commit PASS |
| responsive handoff | required responsive intent exact text PASS |
| local-only boundary | no network-capable API/dependency, local asset references only PASS |

## Logic validation

| Gate | Result |
|---|---|
| JavaScript syntax (`node --check`) | PASS |
| focused Layout Lab tests | `20/20 PASS` |
| authoritative candidate parity | `CANDIDATE_PARITY_PASS` |
| `npm run check` | `544/544 PASS` |
| `git diff --check` | PASS |
| production `src/**` / `dist/**` diff | `0 files` |
| Apps Script bundle regeneration | NOT RUN (forbidden / unnecessary) |

`npm run check`はrepository canonical validatorsと全testを実行した。初回focused runの1 failureは左端fieldをさらに西へ広げようとしたtest fixtureの誤りで、両側に余白があるfieldへ修正後、8方向を独立確認した。application failureではない。

## Browser qualification

CODEX-01でChrome automationからlocal `file://` navigationがbrowser policyに拒否される`AUTOMATION_TOOLING_LIMITATION`は分類済みであり、instructionに従って別runtimeや迂回経路を作っていない。

2026-09-18、USERは`open-layout-lab.bat`からactual local surfaceを開き、最終提示した確認項目に対して`確認完了`を返した。この直接確認により、rendered layout、viewport behavior、主要direct-manipulation操作、handoff文言、console状態を`PASS`として受理する。deterministic testsが担うv1 migration、JSON model、collision/history semanticsと組み合わせ、CODEX-02のbrowser qualificationは完了した。

### Executed USER checklist

USERがactual `file://` surfaceで確認した最終checklistは次のとおり。

1. 初期表示が12 columns / width 100% / max-width 2000px / left / gap 14px・14pxである。
2. Row 1がDate → Time → Location → Team → Asset Classで、hidden fieldがspaceを消費しない。
3. Wide → Laptop → Compact → Wideで配置とexport JSONが変わらない。
4. Mobileだけ1-columnになり、desktopへ戻すとcanonical placementが復元される。
5. drag、8-direction resize、inspector、Standard/Fine、undo/redoが操作できる。
6. Codex handoffにmax-width 2000px、desktop canonical placement維持、720px以下のみ1-columnのintentが出る。
7. browser consoleのmaterial error/warnが0。

Result: `USER_CONFIRMED_PASS`。

## Git / delivery

- Branch: `codex/0033-ui-layout-lab`
- Draft PR: `#55`
- New PR: `0`
- Merge: `NOT RUN`

## Side-effect state / readiness

```text
SPEC_VERSION: 2
PREFERRED_CANDIDATE: CURRENT_12_COLUMN / PASS
SUPERSEDED_CANDIDATE_77_PERCENT_24_COLUMN: NOT_USED
SUPERSEDED_MAX_WIDTH_1680PX: NOT_USED
CURRENT_MAX_WIDTH_PX: 2000
AUTHORITATIVE_CANDIDATE_PARITY: PASS
DESKTOP_TOPOLOGY: PRESERVED_WIDE_LAPTOP_COMPACT
VIEWPORT_CANONICAL_JSON_MUTATION: 0
MOBILE_PROJECTION: ONE_COLUMN_VISUAL_ONLY
DIRECT_PLACEMENT_MODEL: PASS
EIGHT_DIRECTION_RESIZE_MODEL: PASS
STANDARD_FINE_CONVERSION: PASS
V1_MIGRATION: PASS
V2_JSON_ROUNDTRIP: PASS
ACCEPTED_CODEX01_FEATURES: PRESERVED_BY_DETERMINISTIC_TESTS
MANUAL_BROWSER_QUALIFICATION: PASS / USER_CONFIRMED
CONSOLE_MATERIAL_ERROR_WARN: 0 / USER_CONFIRMED
PRODUCTION_SRC_MODIFICATION: 0
APPS_SCRIPT_DEPLOYMENT: 0
NETWORK_CALLS: 0
GOOGLE_CALLS: 0
PROVIDER_CALLS: 0
REAL_CONFIDENTIAL_DATA: 0
WORK_0030: DEFERRED_BY_USER
BLOCKER: NONE
READY_FOR_CHATGPT_FINAL_REVIEW: YES
```

## Shared Knowledge

KNOWLEDGE_RETRIEVAL: RULE-0001, RULE-0002
KNOWLEDGE_APPLIED: RULE-0001, RULE-0002
NEW_KNOWLEDGE_CANDIDATE: NO

WORK_ID: 0033
DISPATCH_ID: 0033-CODEX-02
BALL: CHATGPT
STATUS: RETURNED
