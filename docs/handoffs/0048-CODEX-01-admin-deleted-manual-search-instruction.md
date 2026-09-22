# Work 0048 CODEX-01 — 削除記録の管理 manual-search only

WORK_ID: 0048
DISPATCH_ID: 0048-CODEX-01
BALL: CODEX
STATUS: READY
MODE: BUILD

## Primary Outcome

管理者ページへ移動しただけでは「削除記録の管理」の検索を実行せず、利用者が条件を指定して「検索」を押したときだけ検索する。

## Recommended model

GPT-5.6 Luna Max。

理由: root causeとdesired behaviorは確定済みで、client event bindingの限定修正とruntime verificationが中心。

## Read first

- `docs/handoffs/0048-admin-deleted-records-manual-search-requirements.md`
- `docs/planning/work0048-admin-deleted-records-manual-search.md`
- `docs/handoffs/0047-completion-report.md`

## Confirmed current cause

Current `src/ClientAiProviderSettings.html`:

```js
aiProviderAdminElement('nav-ai-provider-settings').addEventListener('click',()=>{
  searchAdminDeletedMeetings();
  loadAiProviderAdminData(false)
});
```

このnavigation handlerが管理者ページentryのたびに削除記録検索を自動実行している。

## Required behavior

- 管理者ページentry -> deleted-record search RPC 0
- 削除記録tab click -> search RPC 0
- keyboard tab switch -> search RPC 0
- filter edit only -> search RPC 0
- initial table message `検索すると記録が表示されます。` を維持
- explicit `検索` click -> exactly 1 search RPC
- 一度検索後に他tabへ移動し戻る -> auto refetch 0、既存結果を保持してよい
- restore success -> 現在条件で1回refreshする現行挙動を維持

AI provider admin data loadは管理者ページentry時に現行どおり維持する。

## Scope

Expected production change:
- `src/ClientAiProviderSettings.html`

Tests / generated bundleは必要に応じて更新。

Backend API変更は不要。

## Preserve

- Work0047 custom Master rename modal / empty pill fix
- Work0046 staged reorder
- Work0045 Theme Settings
- admin tab keyboard behavior
- owner-only access
- Work0030 deferred

## Tests

Focused RPC count:
- ADMIN_PAGE_ENTRY_DELETED_SEARCH_RPC: 0
- DELETED_TAB_CLICK_SEARCH_RPC: 0
- KEYBOARD_TAB_SWITCH_SEARCH_RPC: 0
- FILTER_EDIT_SEARCH_RPC: 0
- EXPLICIT_SEARCH_CLICK_RPC: 1
- RESTORE_SUCCESS_REFRESH_SEARCH_RPC: 1

Then:
- focused tests
- npm run check
- bundle regeneration
- npm run check:bundle
- git diff --check

## Runtime qualification

Same owner-only Web App.

Expected final served version: 30.

Required runtime:
- admin page entry: no deleted-record loading/status/result fetch
- deleted tab initial: filters usable, initial empty message preserved
- explicit Search: normal loading/result count
- return from another admin tab: no automatic refetch
- restore smoke if safe; final data state restored
- 7 normal pages nonblank
- console material error/warn 0
- provider calls unrelated to existing provider-admin load: 0

## Safety

```text
BACKEND_API_CHANGE: 0
SCHEMA_CHANGE: 0
MIGRATION_CHANGE: 0
PROVIDER_POLICY_CHANGE: 0
PERMISSION_BROADENING: 0
PUBLIC_EXPOSURE: 0
WORK_0030: DEFERRED_BY_USER
```

## Delivery

Branch:
`codex/0048-admin-deleted-manual-search`

Draft PR, do not merge.

Report:
`docs/handoffs/0048-CODEX-01-admin-deleted-manual-search-report.md`

Update:
`docs/handoffs/0048-dispatches.md`

WORK_ID: 0048
DISPATCH_ID: 0048-CODEX-01
BALL: CODEX
STATUS: READY
