# Work 0054 — No-admin-role / Settings unification requirements

WORK_ID: 0054
STATUS: PLANNED
MODE: BUILD
DEPENDENCY: Work0053 ACCEPTED
ACTIVE_DISPATCH: NONE
BALL: NONE

## Primary Outcome

Private Assets Intelligenceからapplication-levelの「管理者 / 一般利用者」区分をなくし、Web Appにアクセスできる利用者は原則同じ機能を利用できるようにする。

Google Workspace / Drive / Apps Script自体のアクセス権限は維持し、アプリ独自のrole gateだけを整理する。

## User decision

```text
IN_APP_ADMIN_ROLE: NONE
AUTHORIZED_WEB_APP_USERS_HAVE_EQUAL_APP_FEATURE_ACCESS: YES
ADMIN_EMAIL_ROSTER_AS_APP_AUTHORIZATION: NO
HARD_CODED_PERSON_AUTHORIZATION: NO
```

## UI

- `管理者ページ` という名称を通常の `設定` へ変更
- `管理者機能` などrole distinctionを示すvisible copyを除去
- AI設定 / 削除記録 / テーマ設定は通常の設定機能として扱う
- mobile / desktop navigation consistencyを維持

## Server authorization

Inventory and remove application-level gates that only distinguish administrators from ordinary Web App users.

Examples include:
- `adminEmails` based operational authorization
- shared-admin unlock/password/session mechanisms if they are now obsolete
- UI state that hides/disables settings solely by admin role

Do not remove:
- Google account authentication itself
- Drive permissions
- Apps Script project/editor permissions
- deployment owner / execute-as / access settings
- provider credential secrecy
- server-side validation unrelated to roles
- optimistic locking / idempotency / destructive-action confirmation

## adminEmails / installer-owner

- `adminEmails` may remain temporarily as legacy installation metadata if removing it would cause unnecessary migration risk
- it must not determine ordinary application feature access after Work0054
- installer/deployment ownership is an infrastructure concept, not an in-app administrator role
- installer safety may continue to rely on Google-side project/editor ownership where needed
- no personnel roster UI is required

## Safety

Equal application access does not mean public internet access.

The effective boundary is:
- whoever has access to the Web App under the Google deployment/access policy

Do not broaden deployment access in this Work.

## Acceptance Evidence

- visible `管理者ページ` / `管理者機能` role wording removed
- all current Web App users can open and use Settings features under the same app rules
- AI settings role-gate removed or proven not applicable
- Theme Settings role-gate removed or proven not applicable
- deleted-record management role-gate removed or proven not applicable
- no `adminEmails` check gates normal Settings actions
- no hard-coded user/email
- Google Drive / Apps Script permissions unchanged
- deployment access unchanged
- provider secrets remain server-side and never rendered
- regression tests / browser tests PASS
- Work0030 remains DEFERRED_BY_USER
