# CODEX-01 — UI Layout Lab report

WORK_ID: 0033
DISPATCH_ID: 0033-CODEX-01
BALL: CHATGPT
STATUS: RETURNED
MODE: BUILD

## Work Contract

- Primary outcome: productionから完全に分離したlocal-only UI Layout Labで、Work 0032/version 8の「記録を追加」を12-column gridとして調整・保存・handoffできるようにする。
- Evidence hierarchy: Chrome `file://`でのactual interaction / rendered state / console、Node focused tests、repository canonical tests、source inspectionの順。
- Required scope: `tools/ui-layout-lab/`、focused tests、本reportとDispatch controlのみ。
- Non-goals: production `src/`、Apps Script bundle/deployment、backend/schema/migration、provider、Work 0030。
- Side-effect boundary: network / Google / provider / confidential data / production mutationすべて0。
- Repair budget: 最大3 coherent cycles。本returnまでapplication repair cycleは`0/3`。

## Implementation

`tools/ui-layout-lab/`に、build stepや外部dependencyを必要としないclassic-script static toolを実装した。

- Work 0032/version 8のvisible Meeting-create field setとproduction DOM ID。
- 12-column snap gridを正本とするdrag reorder、pointer/mouse horizontal resize、notes / attachment vertical resize。
- field paletteのhide/showと、selected-field inspectorの数値調整。
- form width / max width / left-center alignment / horizontal-vertical gap / editing grid controls。
- `Wide desktop 2560` / `Laptop 1440` / `Compact 1280` / `Mobile 390` preview。Mobileはdesktop specを壊さず1-column表示する。
- Current v8 / Compact Institutional / Balanced Professional / Memo Firstの4 preset。
- deterministic `整える`とnumeric scoreを使わない`気になる点`。
- bounded historyによるundo / redo / reset。
- localStorage named variant save / load / deleteとunsaved indicator。
- canonical spec version 1のstable JSON export / import / copy / download。invalid importはfail-closed。
- visual-only境界を含む日本語Codex handoff生成 / copy / Markdown download。
- local imageをtab memory内だけで扱うreference overlayとopacity control。画像bytesはrepository/localStorageへ保存しない。
- Windows double-click用`open-layout-lab.bat`。

Pure layout modelをbrowser UIとNode testsで共有し、test-onlyのparallel business logicを作っていない。

Implementation commit: `bc8f459`。

## Logic validation

| Gate | Result |
|---|---|
| JavaScript syntax (`node --check`) | PASS |
| focused Layout Lab tests | `12/12 PASS` |
| all four preset schema / unique stable IDs / colSpan bounds | PASS |
| Current v8 baseline contract | PASS |
| auto tidy validity / determinism / idempotency | PASS |
| JSON exact roundtrip / invalid import fail-closed | PASS |
| hidden state / history / Codex handoff | PASS |
| local assets only / network-capable dependency absent | PASS |
| `npm run check` | `536/536 PASS` |
| `git diff --check` | PASS |

`npm run check`はrepository canonical validationと全testを実行した。Apps Script bundleは変更・再生成していない。

## Browser qualification

### Observed

- Chrome automationからlocal `file://` targetを開こうとしたところ、browser security policyによりnavigationが拒否された。
- 同policyは別browser surface、間接起動、raw browser command等による迂回を禁止しているため、evidence boundaryを守って停止した。
- これはLayout Labのload/runtime/application failureではなく、`AUTOMATION_TOOLING_LIMITATION`である。

### User-assisted target-runtime evidence

Chrome automation limitationを回避する実装変更やalternate runtimeは使わず、ユーザーが`tools/ui-layout-lab/open-layout-lab.bat`からactual local `file://` surfaceを開いた。前回returnで次のexact checklistを提示し、ユーザーから`確認完了`を受領した。

1. 4 presetを順に適用できる。
2. 3 field以上をdragし、順序が変わる。
3. 2 field以上を右edgeで横resizeし、notesを下edgeで縦resizeできる。
4. 1 fieldをhide/showし、undo/redoで状態が戻る。
5. 名前付きvariantをsave/loadできる。
6. JSONをdownloadし、同じfileを選択してimportするとerrorなくexact canonical JSONへ戻る。
7. `Codexに渡す`で日本語briefとJSONが生成される。
8. Wide desktopとMobile previewを切替できる。
9. 任意の非機密local画像をoverlayし、opacityを変えて外せる。
10. browser consoleのmaterial error/warnが0。

この返答は、全項目に問題がない場合だけ`確認完了`と返すpredeclared evidence contractに対する直接回答である。したがって4 preset、3 field以上のdrag、2 field以上の横resize、notes縦resize、hide/show、undo/redo、variant save/load、JSON exact roundtrip、Codex handoff、desktop/mobile preview、local overlay、console material error/warn 0を`PASS (USER_CONFIRMED)`として受け入れた。private画像やJSONの共有は受けていない。

## Git / delivery

- Branch: `codex/0033-ui-layout-lab`
- Draft PR: `#55`
- Merge: `NOT RUN`

## Side-effect state / readiness

```text
LAYOUT_LAB: USABLE
PRESETS: 4_PASS
DRAG_RESIZE: PASS
HIDE_SHOW: PASS
VIEWPORT_PREVIEW: PASS
AUTO_TIDY_LINT: PASS
UNDO_REDO: PASS
LOCAL_VARIANTS: PASS
JSON_ROUNDTRIP: PASS
CODEX_HANDOFF: PASS
REFERENCE_IMAGE_LOCAL_ONLY: PASS
MANUAL_BROWSER_QUALIFICATION: PASS (USER_CONFIRMED)
CONSOLE_MATERIAL_ERROR_WARN: 0 (USER_CONFIRMED)
AUTOMATION_LIMITATION: FILE_URL_BLOCKED_BY_BROWSER_POLICY / SUPERSEDED_BY_USER_EVIDENCE
NETWORK_CALLS: 0
GOOGLE_CALLS: 0
PROVIDER_CALLS: 0
CONFIDENTIAL_DATA: 0
PRODUCTION_SOURCE_CHANGES: 0
APPS_SCRIPT_DEPLOYMENT: 0
WORK_0030: DEFERRED_BY_USER
BLOCKER: NONE
READY_FOR_CHATGPT_FINAL_REVIEW: YES
```

## Shared Knowledge

KNOWLEDGE_RETRIEVAL: RULE-0001, RULE-0002
KNOWLEDGE_APPLIED: RULE-0001, RULE-0002
NEW_KNOWLEDGE_CANDIDATE: NO

WORK_ID: 0033
DISPATCH_ID: 0033-CODEX-01
BALL: CHATGPT
STATUS: RETURNED
