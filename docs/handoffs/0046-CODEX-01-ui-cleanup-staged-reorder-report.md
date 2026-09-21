# Work 0046 CODEX-01 — UI cleanup / Analytics tabs / staged Master reorder report

WORK_ID: 0046
DISPATCH_ID: 0046-CODEX-01
BALL: CHATGPT
STATUS: RETURNED
MODE: BUILD

## Outcome

Work0045 version27のaccepted baselineを維持したまま、通常UIとprint/PDFからCounterparty internal IDおよびfollow-up表示を除去した。面談先サマリーをexact 3 cardsへ整理し、面談実績の集計を`グラフ / 面談一覧`のpresentation-only tabsへ変更した。Master並び替えは、3種別ごとのlocal draftから明示Saveするcomplete-order batch mutationへ移行した。

same existing owner-only Web Appをversion28へ更新し、7画面・4 viewport、代表dynamic state、可逆Master reorderをactual browserで確認した。runtime資格確認の並び替えは元順序へ復元済みである。

```text
OUTCOME: PASS
LOGIC_VALIDATION: PASS
TARGET_RUNTIME_QUALIFICATION: PASS
VISIBLE_COUNTERPARTY_INTERNAL_ID: 0
VISIBLE_FOLLOW_UP_SURFACE: 0
MASTER_FINAL_ORDER_RESTORED: YES
BLOCKER: NONE
READY_FOR_CHATGPT_FINAL_REVIEW: YES
```

## Git / source identity

```text
BASELINE_MAIN: 6fd9b0505c85b08ff5a8f5ff7cc6e6f66546c358
BRANCH: codex/0046-ui-cleanup-staged-reorder
DRAFT_PR: #68
APPLICATION_SOURCE_COMMIT: 1869d9b12fbef3d77cd8ce876883d3c21a850889
DEPLOYABLE_BUNDLE_COMMIT: 08d2f8899dd5530a703675b5b120c4850afbf5f1
SOURCE_OF_TRUTH: src/**
```

## Final source scope

### Visible surface

- `Entity Workspace` selector・identity・printからCounterparty internal IDを除去した。
- 面談先サマリーのtop cardsを`面談件数 / 保存資料数 / 最後の面談日`のexact 3 cardsへ変更した。
- Past Meeting、Entity Workspace、Knowledge Search、Full Output、AI用prompt、Analyticsからvisible follow-up wording / badge / metric / columnを除去した。
- Meeting ID / Document IDの管理・照合表示は維持した。

### Analytics

- top titleを`面談実績の集計`へ統一した。
- filter card直下にaccessibleな`グラフ / 面談一覧`tabsを追加し、defaultを`グラフ`にした。
- graph panelは`選択した内訳`、`集計サマリー`の順、list panelは`該当Meeting`とした。
- service responseへauthoritative master name fieldsを追加し、internal keyはRPC contract内に保持したまま表示fallbackから除外した。

### Master staged reorder

- `ASSET_CLASS / LOCATION / TEAM`ごとに独立したdraft orderを持つ。
- drag/dropはlocal draftだけを更新し、`並び順を保存`が1回の`REORDER_BATCH` RPCを送る。
- `expectedOrderIds`とcomplete `orderedIds`を同一lock内で検証する。
- stale expected order、重複、欠落、foreign typeはwrite前にfail-closedとした。
- complete `Option_Master` bodyを1回のbounded `setValues`で保存し、1回の`OPTION_REORDER` auditを生成する。
- dirty中は同一tabのadd / rename / status mutationをdisableし、`再読込`はdraft破棄確認を要求する。

schema、migration、provider、permission、theme token contractは変更していない。backendの`Follow_Up_Required` / `Follow_Up_Note`およびhistorical valuesは保持している。

## Deterministic validation

修正前のproduction sourceを対象にfocused Work0046 testsを追加し、visible ID / follow-up leakage、Analytics tabs、immediate reorderを再現した。修正後は以下を確認した。

```text
FOCUSED_WORK0046_AND_RELATED_TESTS: 63/63 PASS
npm run check: 625/625 PASS
npm run check:bundle: 30/30 PASS
APPS_SCRIPT_SOURCE_VALIDATION: 61 server sources / 23 HTML resources PASS
PUBLIC_SURFACE_VALIDATION: 32 normal / 3 guarded operator / 817 private PASS
TEMPORAL_VALIDATION: PASS
git diff --check: PASS
BUNDLE_BYTES: 1261000
BUNDLE_LINES: 19706
```

Focused evidence:

```text
TAB_SWITCH_RPC_COUNT: 0
DRAG_RPC_COUNT_BEFORE_SAVE: 0
MULTIPLE_DRAGS_ONE_SAVE_RPC_COUNT: 1
BATCH_SHEET_WRITE_COUNT: 1
BATCH_SUCCESS_AUDIT_COUNT: 1
STALE_CONFLICT_OPTION_WRITE_COUNT: 0
STALE_CONFLICT_AUDIT_COUNT: 0
PER_TAB_DRAFT_RETENTION: PASS
UNCHANGED_SAVE_DISABLED: PASS
MEETING_ID_DOCUMENT_ID_PRESERVATION: PASS
```

## Deployment / parity

read-only preflightでsame target、single owner-only Web App、version27、saved / immutable source parityを確認した。source sync、immutable version作成、same deployment updateを各1回実行した。deployment update直後のmetadataがpendingだったため更新を再送せず、独立read-only verifyでversion28への収束と両parityを確認した。

```text
TARGETS_CREATED: 0
SOURCE_SYNCS: 1
IMMUTABLE_VERSIONS_CREATED: 1
EXISTING_DEPLOYMENT_UPDATES: 1
DEPLOYMENT_UPDATE_RETRIES: 0
SECOND_DEPLOYMENT: 0
FINAL_SERVED_VERSION: 28
VERSIONED_DEPLOYMENT_COUNT: 1
WEB_APP_COUNT: 1
EXECUTE_AS: USER_DEPLOYING
ACCESS: MYSELF
SAVED_SOURCE_PARITY: PASS
IMMUTABLE_VERSION28_SOURCE_PARITY: PASS
PERMISSION_BROADENING: 0
PUBLIC_EXPOSURE: 0
```

## Target runtime qualification

### A. 7 pages / responsive

```text
NORMAL_NAV_PAGES_2560: 7/7 ACTIVE_AND_NONBLANK
NORMAL_NAV_PAGES_1440: 7/7 ACTIVE_AND_NONBLANK
NORMAL_NAV_PAGES_1280: 7/7 ACTIVE_AND_NONBLANK
NORMAL_NAV_PAGES_390: 7/7 ACTIVE_AND_NONBLANK
HORIZONTAL_OVERFLOW_2560: 0/7
HORIZONTAL_OVERFLOW_1440: 0/7
HORIZONTAL_OVERFLOW_1280: 0/7
HORIZONTAL_OVERFLOW_390: 0/7
CONSOLE_MATERIAL_ERROR_WARN: 0
```

### B. Visible surface sweep

全7 normal pagesのrendered `innerText`を画面切替後に確認した。面談先サマリーではsynthetic Counterpartyを選択してloaded stateとprint/PDF DOMも確認した。

```text
VISIBLE_CP_PATTERN_ALL_7_PAGES: 0
VISIBLE_COUNTERPARTY_ENTITY_KEY_PATTERN: 0
VISIBLE_FOLLOW_UP_TERMS_ALL_7_PAGES: 0
PRINT_PDF_COUNTERPARTY_ID_PATTERN: 0
PRINT_PDF_FOLLOW_UP_TERMS: 0
MEETING_ID_RUNTIME_VALUES_PRESENT: YES
DOCUMENT_ID_COLUMN_PRESENT: YES
```

### C. Entity summary

```text
SELECTED_SYNTHETIC_ENTITY_LOAD: PASS
SUMMARY_CARD_COUNT: 3
SUMMARY_LABELS: 面談件数 / 保存資料数 / 最後の面談日
SUMMARY_DESKTOP_WIDTHS: 370px / 370px / 370px
IDENTITY_LINE_VISIBLE: NO
COUNTERPARTY_ID_PATTERN: 0
FOLLOW_UP_CARD: 0
RELATIONSHIPS_SUMMARY_CARD: 0
PRINT_SECTIONS: 面談記録 / 保存資料 / 関連資料 / 活動履歴
```

### D. Analytics tabs

```text
TITLE: 面談実績の集計
TABS: グラフ / 面談一覧
DEFAULT_SELECTED: グラフ
GRAPH_HEADINGS: 選択した内訳 -> 集計サマリー
LIST_HEADING: 該当Meeting
LIST_RUNTIME_ROWS: 7
MEETING_ID_HEADER: PRESENT
COUNTERPARTY_ID_PATTERN: 0
FOLLOW_UP_TERMS: 0
KEYBOARD_ARROW_LEFT_RIGHT: PASS
```

tab click / keyboard switchの前後でstatusは`集計しました。`のまま、loaded row setも維持された。production-client harnessではtab switch中の`serverCall`を計数し、RPC 0を直接確認した。

### E. Master staged reorder

runtimeでは既定seedだけの`ASSET_CLASS`を可逆対象とし、real business recordは変更していない。

1. 2回のdragでlocal draftを変更した。
2. 別browser contextのauthoritative readでserver orderが開始時のままであることを確認した。
3. `TEAM`へtab切替後に`ASSET_CLASS`へ戻り、dirty draftがexact復元されることを確認した。
4. `並び順を保存`を1回だけclickし、success後に別contextを`再読込`してdraft orderとのexact一致を確認した。
5. 同じlocal draft方式で開始時順序を組み立て、復元用Saveを1回だけ実行した。
6. 最終別context readbackで開始時順序とのexact一致を確認した。

```text
REORDERABLE_TABS: ASSET_CLASS / LOCATION / TEAM
RUNTIME_DRAGS_BEFORE_ACCEPTANCE_SAVE: 2
PRE_SAVE_AUTHORITATIVE_ORDER_UNCHANGED: PASS
PRE_SAVE_SERVER_MUTATIONS: 0
DIRTY_INDICATOR: PASS
PER_TAB_DRAFT_RETENTION: PASS
ACCEPTANCE_SAVE_UI_ACTIONS: 1
ACCEPTANCE_BATCH_MUTATIONS: 1
POST_SAVE_AUTHORITATIVE_ORDER_MATCH: PASS
RESTORATION_SAVE_UI_ACTIONS: 1
RESTORATION_BATCH_MUTATIONS: 1
FINAL_AUTHORITATIVE_ORDER_EQUALS_START: PASS
FINAL_DIRTY_STATE: CLEAN
UNCHANGED_SAVE_DISABLED_ALL_3_TABS: PASS
```

Audit contractはdeployed production serviceと同じfocused environmentで、1 batch successにつき`OPTION_REORDER` 1件、`Changed_Fields: Option_Order`、before/after complete affected order snapshotを確認した。stale conflictはOption write 0 / audit 0である。restricted Audit storageはnormal owner-only Web App UIにread facadeを持たないため、live Audit rowの直接readbackはこのDispatchでは追加していない。

### F. Work0045 theme regression

```text
THEME_SETTINGS_TAB: VISIBLE_AND_WORKING
THEME_FIELD_COUNT: 16
THEME_STATE: 既定の配色を使用中
SIDEBAR_BACKGROUND: #2D3E49
MAIN_PAGE_BACKGROUND: #E7EDF2
MAIN_CARD_BACKGROUND: #F8FAFB
MAIN_SECTION_HEADER: #CDD9E2
ACTION_PRIMARY: #405F72
THEME_SAVE_OR_RESET_ACTIONS: 0
```

## Side-effect state

```text
FOLLOW_UP_DATA_DELETE: 0
FOLLOW_UP_DATA_MIGRATION: 0
MEETING_RECORD_MUTATION: 0
PITCHBOOK_RECORD_MUTATION: 0
FILE_MUTATION: 0
DOC_MUTATION: 0
MASTER_ACCEPTANCE_BATCH_MUTATION: 1
MASTER_RESTORATION_BATCH_MUTATION: 1
FINAL_MASTER_ORDER_DRIFT: 0
PHYSICAL_DELETE: 0
SCHEMA_CHANGE: 0
MIGRATION_CHANGE: 0
PROVIDER_CALLS: 0
AI_SYNC_CHANGE: 0
CONFIDENTIAL_DATA: 0
PERMISSION_BROADENING: 0
PUBLIC_EXPOSURE: 0
WORK_0030: DEFERRED_BY_USER
```

## Shared Knowledge

```text
KNOWLEDGE_RETRIEVAL: RULE-0001, RULE-0002, PAT-0004
KNOWLEDGE_APPLIED: RULE-0001, RULE-0002, PAT-0004
NEW_KNOWLEDGE_CANDIDATE: NONE
```

WORK_ID: 0046
DISPATCH_ID: 0046-CODEX-01
BALL: CHATGPT
STATUS: RETURNED
