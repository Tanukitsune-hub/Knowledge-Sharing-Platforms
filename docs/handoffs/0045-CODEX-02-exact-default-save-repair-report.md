# Work 0045 CODEX-02 — exact-default first-save repair report

WORK_ID: 0045
DISPATCH_ID: 0045-CODEX-02
BALL: CHATGPT
STATUS: RETURNED
MODE: BUILD

## Outcome

`persisted=false`かつpaletteがWork0044 defaultと同値でも初回`保存`を実行できるよう、
`src/ClientThemeSettings.html`のSave可否とhandler guardだけを限定修正した。same existing
owner-only Web Appをversion27へ更新し、通常UIでexact-default save、fresh reload、reset、
final fresh reloadまで完了した。

qualification開始時には、CODEX-01のfinal ABSENT証拠後に別経路で保存されたnon-default
overrideをread-onlyで検出した。今回のDispatchによる設定ではないため無断削除せず、
ユーザー確認を得てpre-qualification cleanupとしてresetした。その後のauthoritative
qualificationはABSENTから開始している。

```text
OUTCOME: PASS
LOGIC_VALIDATION: PASS
TARGET_RUNTIME_QUALIFICATION: PASS
EXACT_DEFAULT_FIRST_SAVE: PASS
FRESH_LOAD_SHARED_PERSISTENCE: PASS
RESET_TO_DEFAULT: PASS
FINAL_THEME_OVERRIDE_STATE: ABSENT
VISIBLE_THEME: WORK0044_DEFAULT
BLOCKER: NONE
READY_FOR_CHATGPT_FINAL_REVIEW: YES
```

## Git / source identity

```text
BASELINE_MAIN: fd6f419b0811b3ab45770f4004b76089fcfcdaec
BRANCH: codex/0045-shared-theme-settings
DRAFT_PR: #67
APPLICATION_SOURCE_COMMIT: a9dfedfb1dd2c8f1fb75f92b8f43251d36816a11
DEPLOYABLE_BUNDLE_COMMIT: a220a1a5ef350dcf7c39365f1be0e22449a23189
RUNTIME_QUALIFIED_HEAD_BEFORE_REPORT: 766d3308b8b2aaca9a8d6746df42092a6cd4c86a
SOURCE_OF_TRUTH: src/**
```

## Exact client repair

Production source changeは`src/ClientThemeSettings.html`のみである。

```text
themeSettingsRefreshState:
  saveAllowed = !busy && !invalid && (dirty || !persisted)

themeSettingsSave guard:
  persisted=true && draft==saved palette の場合だけ同値no-op
  persisted=false && draft==default palette はSAVEを許可
```

fake dirty flag、palette値変更、design変更、token定義変更、server storage変更は行っていない。

## Deterministic validation

```text
FOCUSED_WORK0045_TESTS: 9/9 PASS
PRODUCTION_UI_BROWSER_HARNESS: PASS
EXACT_DEFAULT_SAVE_RPC_COUNT_IN_HARNESS: 1
PERSISTED_UNCHANGED_DUPLICATE_SAVE: 0
INVALID_HEX_PROTECTION: PASS
DIRTY_PREVIEW_DISCARD: PASS
npm run check: 615/615 PASS
npm run check:bundle: 30/30 PASS
APPS_SCRIPT_SOURCE_VALIDATION: 61 server sources / 23 HTML resources PASS
git diff --check: PASS
```

canonical bundleはapplication source commitを指定して再生成した。

```text
BUNDLE_BYTES: 1250742
BUNDLE_LINES: 19585
```

## Deployment / parity

read-only preflightでsame target、single owner-only Web App、version26、saved / immutable
source parityを確認した。認可予算内でsource sync、immutable version作成、same deployment
updateを各1回だけ実行した。update直後に再送せず、独立read-only verificationでversion27
と両parityを確認した。

```text
TARGETS_CREATED: 0
SOURCE_SYNCS: 1
IMMUTABLE_VERSIONS_CREATED: 1
EXISTING_DEPLOYMENT_UPDATES: 1
SECOND_DEPLOYMENT: 0
FINAL_SERVED_VERSION: 27
VERSIONED_DEPLOYMENT_COUNT: 1
WEB_APP_COUNT: 1
EXECUTE_AS: USER_DEPLOYING
ACCESS: MYSELF
SAVED_SOURCE_PARITY: PASS
IMMUTABLE_VERSION27_SOURCE_PARITY: PASS
PERMISSION_BROADENING: 0
PUBLIC_EXPOSURE: 0
```

## Runtime qualification

### Pre-qualification recovery

最初のread-only loadでは`persisted:true`かつWork0044 defaultと3 keys異なるsaved overrideを
観測した。更新はごく最近で、CODEX-02のSave前だった。ユーザー確認後、通常UIの
`既定の配色に戻す`でresetした。reset直後に16 fields / computed themeがdefault exact、
Save enabled、unsaved preview表示なしを確認し、fresh reloadでABSENTを固定してから
qualificationを開始した。

```text
PREEXISTING_OVERRIDE_PROVENANCE: OUTSIDE_CODEX02
PREEXISTING_OVERRIDE_RESET: USER_CONFIRMED
REAL_RECORD_OR_FILE_MUTATION: 0
```

### A. Initial ABSENT

```text
KSP_THEME_SETTINGS_V1: ABSENT
BOOTSTRAP_PERSISTED: false
BOOTSTRAP_PALETTE_EXACT: PASS
COMPUTED_PALETTE_EXACT: PASS
INITIAL_THEME_STYLE_IN_HEAD: PASS
THEME_BOOTSTRAP_IN_HEAD: PASS
SAVE_ENABLED_WITH_EXACT_DEFAULT: PASS
UNSAVED_PREVIEW_STATUS: ABSENT
```

### B. Exact-default shared save

16色を一切変更せず、通常UIの`保存`を1回だけclickした。

```text
SAVE_UI_ACTION_COUNT: 1
SAVE_STATUS: 保存しました
STATE_LABEL: 共有設定を適用中
RESULTING_PERSISTED: true
FIELDS_16_EXACT_DEFAULT: PASS
VISIBLE_COMPUTED_THEME_EXACT: PASS
SAVE_DISABLED_AFTER_SUCCESS: PASS
DUPLICATE_SAVE_ACTION: 0
```

### C. Fresh-load persistence

```text
FRESH_BOOTSTRAP_PERSISTED: true
FRESH_BOOTSTRAP_PALETTE_EXACT: PASS
FRESH_COMPUTED_PALETTE_EXACT: PASS
INITIAL_THEME_STYLE_IN_HEAD: PASS
THEME_BOOTSTRAP_IN_HEAD: PASS
SAVE_DISABLED_PERSISTED_UNCHANGED: PASS
POST_PAINT_THEME_JUMP_OBSERVED: 0
```

### D. Reset closure

通常UIの`既定の配色に戻す`とconfirmationを実行し、success表示後にfresh reloadした。

```text
RESET_STATUS: 既定の配色に戻しました
FINAL_BOOTSTRAP_PERSISTED: false
FINAL_THEME_OVERRIDE_STATE: ABSENT
FINAL_BOOTSTRAP_PALETTE_EXACT: PASS
FINAL_COMPUTED_PALETTE_EXACT: PASS
FINAL_INITIAL_THEME_STYLE_IN_HEAD: PASS
FINAL_VISIBLE_THEME: WORK0044_DEFAULT
```

### E. Minimal runtime regression

```text
NORMAL_NAV_PAGES_1440: 7/7 ACTIVE_AND_NONBLANK
NORMAL_NAV_HORIZONTAL_OVERFLOW_1440: 0/7
THEME_SETTINGS_1440: 16 fields / overflow 0
THEME_SETTINGS_390: 16 fields / overflow 0
PREVIEW_COMPUTED_UPDATE: PASS
DISCARD_RESTORES_EXACT_DEFAULT: PASS
PREVIEW_STORAGE_MUTATION: 0
CONSOLE_MATERIAL_ERROR_WARN: 0
PROVIDER_CALLS: 0
```

CODEX-01でaccepted済みの全4 viewport・全画面visual evidenceは再実行せず、client
save-state repairに対応するdecisive pathだけを追加確認した。

## Side-effect state

```text
THEME_SAVE_RESET_ROUNDTRIP: 1
FINAL_KSP_THEME_SETTINGS_V1: ABSENT
THEME_DESIGN_CHANGE: 0
TOKEN_DEFINITION_CHANGE: 0
SERVER_STORAGE_REDESIGN: 0
NEW_SHEET: 0
SCHEMA_CHANGE: 0
MIGRATION_CHANGE: 0
TRIGGER_CHANGE: 0
PROVIDER_CALLS: 0
AI_SYNC_CHANGE: 0
RECORD_MUTATION: 0
FILE_MUTATION: 0
CONFIDENTIAL_DATA: 0
PHYSICAL_DELETE: 0
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

WORK_ID: 0045
DISPATCH_ID: 0045-CODEX-02
BALL: CHATGPT
STATUS: RETURNED
