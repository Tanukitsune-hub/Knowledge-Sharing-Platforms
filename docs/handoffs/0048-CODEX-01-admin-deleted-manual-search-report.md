# Work 0048 CODEX-01 — 削除記録の管理 manual-search report

WORK_ID: 0048
DISPATCH_ID: 0048-CODEX-01
BALL: CHATGPT
STATUS: RETURNED
MODE: BUILD

## Outcome

Work0047 version29 accepted baselineを維持し、管理者ページの「削除記録の管理」をmanual-search onlyへ変更した。

- 管理者ページentryでは削除記録を検索しない。
- 削除記録tab click / keyboard切替 / filter変更だけでは検索しない。
- 利用者が「検索」を押した時だけ現在条件で1回検索する。
- 一度検索した結果はtab移動と管理者ページ再entry後も保持し、自動再検索しない。
- 復元成功後に現在条件で1回refreshする既存経路は維持した。
- AI provider admin dataの通常loadは維持した。

## Root cause and production fix

原因は`src/ClientAiProviderSettings.html`の管理者ページnavigation handlerが、AI provider admin data loadと同時に`searchAdminDeletedMeetings()`を直接呼んでいたことだった。

production変更はこの自動呼出しの除去だけである。

```js
aiProviderAdminElement('nav-ai-provider-settings')
  .addEventListener('click',()=>loadAiProviderAdminData(false));
```

`searchAdminDeletedMeetings()`の呼出し経路は、明示的な`検索`buttonとrestore-success refreshだけに限定された。backend API、payload、loading/result/error UI、restore semanticsは変更していない。

## Production scope

- `src/ClientAiProviderSettings.html`
  - navigation entryからdeleted-record searchを除去。
- backend `.gs`
  - 変更なし。
- UI / schema / migration / permissions
  - 変更なし。

## Focused RPC-count evidence

`tests/work0048-admin-deleted-manual-search.test.cjs`でproduction client codeを実行し、以下を固定した。

```text
ADMIN_PAGE_ENTRY_DELETED_SEARCH_RPC: 0
ADMIN_PAGE_ENTRY_PROVIDER_DATA_LOAD: 1
DELETED_TAB_CLICK_SEARCH_RPC: 0
KEYBOARD_TAB_SWITCH_SEARCH_RPC: 0
FILTER_EDIT_SEARCH_RPC: 0
EXPLICIT_SEARCH_CLICK_RPC: 1
TAB_RETURN_AUTO_SEARCH_RPC: 0
RESTORE_SUCCESS_STATUS_RPC: 1
RESTORE_SUCCESS_REFRESH_SEARCH_RPC: 1
FOCUSED_TESTS: 5/5 PASS
```

初回table message `検索すると記録が表示されます。`もstatic/runtimeの両方で維持している。

## Logic validation

```text
LOGIC_VALIDATION: 636/636 PASS
BUNDLE_VALIDATION: 30/30 PASS
SYNTHETIC_RENDER: PASS
SYNTHETIC_VIEWPORTS: 2560 / 1440 / 1280 / 1366 / 390
SYNTHETIC_NORMAL_PAGES: 7/7 PASS
GIT_DIFF_CHECK: PASS
AGENT_FOUNDATION: PASS
LATEST_MAIN_INTEGRATED: d52c3a3b0e527b5704e6d174173e588480dbf0d5
SERVER_SOURCE_COUNT: 61
EMBEDDED_HTML_COUNT: 23
IMPLEMENTATION_COMMIT: 15dca29b016ab8366135150762721947f18f7280
BUNDLE_FILE_SHA256: 7f80346ef68360e65c1bafcbef12e6a40b90a3a756da89a950f33a7781be06bc
```

## Deployment

Work0047のactive deployment、owner project、execute-as、owner-only access、同一Web App URL、one-file bundle source familyを独立して確認した。repositoryの別project向けlocal mappingには依存せず、識別済みtarget専用のdisposable sync directoryを使用した。

```text
BASELINE_SERVED_VERSION: 29
SOURCE_SYNC: 1
SOURCE_READBACK_BYTE_PARITY: PASS
MANIFEST_READBACK_PARITY: PASS
IMMUTABLE_VERSION_CREATED: 1
EXISTING_DEPLOYMENT_UPDATE: 1
NEW_DEPLOYMENT: 0
FINAL_SERVED_VERSION: 30
WEB_APP_URL_CHANGED: NO
EXECUTE_AS_CHANGED: NO
ACCESS_CHANGED: NO
OWNER_ONLY: YES
```

## Target runtime qualification

same owner-only Web App version30で次を確認した。

```text
ADMIN_PAGE_ENTRY_DELETED_LOADING: 0
ADMIN_PAGE_ENTRY_INITIAL_MESSAGE_PRESERVED: YES
ADMIN_PAGE_ENTRY_PROVIDER_DATA_LOAD: PASS
DELETED_TAB_CLICK_AUTO_SEARCH: 0
KEYBOARD_TAB_SWITCH_AUTO_SEARCH: 0
FILTER_EDIT_AUTO_SEARCH: 0
EXPLICIT_SEARCH_CLICK_COUNT: 1
EXPLICIT_SEARCH_LOADING_STATE: PASS
EXPLICIT_SEARCH_RESULT_STATUS: PASS
TAB_RETURN_AUTO_SEARCH: 0
TAB_RETURN_RESULTS_PRESERVED: YES
ADMIN_REENTRY_AUTO_SEARCH: 0
ADMIN_REENTRY_RESULTS_PRESERVED: YES
NORMAL_NAVIGATION: 7/7 PASS
WORK0047_EMPTY_IDENTITY_PILL: 0
WORK0047_MASTER_RENAME_CUSTOM_MODAL: PASS
WORK0047_MASTER_RENAME_NATIVE_DIALOG: 0
CONSOLE_MATERIAL_ERROR_WARN: 0
PROVIDER_MUTATION_OR_QUERY_CALLS: 0
```

live restoreは既存の削除済みMeeting statusを変更し、最終復元のために再削除を必要とするため、`NOT_RUN_SAFETY`とした。restore-success後のexactly one refreshはfocused production-client testでPASSしており、runtimeのMeeting status mutationは0、最終data driftも0である。

```text
RESTORE_RUNTIME_SMOKE: NOT_RUN_SAFETY
RESTORE_LOGIC_REFRESH: PASS
MEETING_STATUS_MUTATION: 0
FINAL_DATA_DRIFT: 0
```

## Side-effect state

```text
MEETING_RECORD_MUTATION: 0
PITCHBOOK_RECORD_MUTATION: 0
MASTER_MUTATION: 0
FILE_MUTATION: 0
DOC_MUTATION: 0
PHYSICAL_DELETE: 0
BACKEND_API_CHANGE: 0
SCHEMA_CHANGE: 0
MIGRATION_CHANGE: 0
PROVIDER_POLICY_CHANGE: 0
AI_SYNC_CHANGE: 0
PERMISSION_BROADENING: 0
PUBLIC_EXPOSURE: 0
WORK_0030: DEFERRED_BY_USER
```

## Shared Knowledge

KNOWLEDGE_RETRIEVAL: RULE-0001, RULE-0002, PAT-0004, OBS-0009
KNOWLEDGE_APPLIED: RULE-0001, RULE-0002, PAT-0004, OBS-0009
NEW_KNOWLEDGE_CANDIDATE: NO

## Return state

```text
LOGIC_VALIDATION: PASS
TARGET_RUNTIME_QUALIFICATION: PASS
SIDE_EFFECT_STATE: NO_DATA_MUTATION
DRAFT_PR: #70
BLOCKER: NONE
READY_FOR_CHATGPT_FINAL_REVIEW: YES
WORK_0048_COMPLETE: NO
COMPLETION_LATCH: NOT_APPLIED
BALL: CHATGPT
STATUS: RETURNED
```

WORK_ID: 0048
DISPATCH_ID: 0048-CODEX-01
BALL: CHATGPT
STATUS: RETURNED
