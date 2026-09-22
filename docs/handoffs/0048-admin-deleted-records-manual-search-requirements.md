# Work 0048 — 削除記録の管理 manual-search only requirements

WORK_ID: 0048
STATUS: PLANNED
MODE: BUILD
DEPENDENCY: Work0047 ACCEPTED
ACTIVE_DISPATCH: NONE
BALL: NONE

## Primary Outcome

管理者ページへ移動しただけでは「削除記録の管理」の検索を実行せず、利用者が検索条件を確認・指定して「検索」buttonを押したときだけ検索する。

## Confirmed current behavior

Current `src/ClientAiProviderSettings.html`:

```js
aiProviderAdminElement('nav-ai-provider-settings').addEventListener('click',()=>{
  searchAdminDeletedMeetings();
  loadAiProviderAdminData(false)
});
```

このため管理者ページへ移動するたびに、削除記録検索が自動実行される。

Admin tab切替の `selectAdminTab()` 自体はdeleted searchを呼んでいない。

## Required behavior

### Page entry

Sidebar / navから管理者ページへ移動:
- AI provider admin data loadは現行どおり必要なら実行してよい。
- `searchAdminDeletedMeetings()` は呼ばない。
- Deleted Recordsのserver search RPC: 0。
- 削除記録一覧は自動更新しない。

### Deleted tab

`削除記録の管理` tabへ切替:
- 自動検索しない。
- tab切替だけでserver search RPC: 0。

### Initial / unsearched state

初回未検索時:
- filter controlsを操作可能。
- table bodyは現行の
  `検索すると記録が表示されます。`
  を維持。
- loading / search statusを表示しない。

### Explicit search

`検索` button click:
- 現行filtersをpayloadにして1回だけ検索。
- existing loading / result count / error UIを維持。

### Restore flow

削除済みMeetingの`復元`は現行動作を維持。

復元成功後に現在の検索条件で一覧を再検索して結果を更新する挙動は許可する。
これはpage entryのauto-searchとは別の、ユーザー操作に伴うrefreshとして扱う。

### Navigation / stale results

一度検索した結果がある状態で他tabへ移動して戻った場合:
- 自動再検索しない。
- 既存結果はそのまま残してよい。
- 利用者が条件を変えて`検索`を押した時のみ更新。

## Expected implementation

最小変更を優先。

Likely production change:
- `src/ClientAiProviderSettings.html`

Expected:
```js
nav click -> loadAiProviderAdminData(false)
```

`searchAdminDeletedMeetings()` は明示的Search button / restore-success refresh以外から呼ばない。

## Non-goals

- deleted-record search filters redesign
- restore behavior redesign
- provider settings load behavior change
- admin tab structure change
- theme settings change
- backend search API change
- schema / migration / permissions
- Work0030

## Acceptance Evidence

- admin page navigation -> deleted search RPC 0
- provider admin load regression 0
- deleted tab click -> deleted search RPC 0
- keyboard tab switch -> deleted search RPC 0
- initial table message preserved
- filter edits alone -> search RPC 0
- Search click -> exactly 1 search RPC
- Restore success -> restore RPC + one result refresh search permitted
- returning to deleted tab after prior search -> no automatic refetch
- Work0047 accepted behavior preserved
- console material error/warn 0
- provider calls unrelated to existing provider-admin page behavior not added
