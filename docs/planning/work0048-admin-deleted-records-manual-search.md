# Work 0048 — manual deleted-record search plan

WORK_ID: 0048
STATUS: ACCEPTED
MODE: BUILD
BASELINE: Work0047 version29
ACTIVE_DISPATCH: NONE
BALL: NONE

## Primary Outcome

管理者ページへのentry / tab switchでは削除記録検索を行わず、明示的な「検索」操作だけで検索する。

## Fastest Safe Decisive Action

Work0047 Completion Latch後:
1. latest mainでcurrent auto-search pathを再確認。
2. navigation handlerから`searchAdminDeletedMeetings()`を除去。
3. explicit Search / restore refresh pathを保持。
4. focused RPC-count tests。
5. bundle / runtime verification。
6. same owner-only Web Appへ限定deploy。
7. ChatGPT final review。

## Expected source scope

- `src/ClientAiProviderSettings.html`
- tests / generated bundle as required

Backend変更不要。

## Routing

Route C予定。

Recommended model:
- GPT-5.6 Luna Max

Reason:
root causeとdesired behaviorが確定済みで、client event bindingの限定修正とruntime確認が中心。

## Deployment target

Work0047 accepted served versionをbaselineに、次immutable versionを1つだけ作る。

## Safety

```text
BACKEND_API_CHANGE: 0
SCHEMA_CHANGE: 0
MIGRATION_CHANGE: 0
PERMISSION_CHANGE: 0
THEME_CHANGE: 0
WORK_0030: DEFERRED_BY_USER
```


## Accepted Outcome

Work0048 completed in PR #70 / version30.
Completion Latch applied. No further Work0048 action is required unless a material regression is found.
