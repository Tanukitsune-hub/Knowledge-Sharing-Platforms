# Work 0054 — No-admin-role / Settings unification plan

WORK_ID: 0054
STATUS: PLANNED
MODE: BUILD
DEPENDENCY: Work0053 ACCEPTED
ACTIVE_DISPATCH: NONE
BALL: NONE

## Primary Outcome

application-level role distinctionを廃止し、現在の「管理者ページ」を通常の「設定」として全Web App利用者へ統一する。

## Fastest Safe Decisive Action

1. role-gated server/client surfaceをinventory
2. Google platform permissionとapplication role gateを分類
3. application role gateだけを除去
4. `管理者ページ` -> `設定`
5. obsolete shared-admin/session codeの扱いを決定し、不要なら限定削除
6. provider credentialsがclientへ漏れないことを再検証
7. desktop/mobile/browser regression
8. same owner-only runtime qualification

## Non-goals

- deployment access broadening
- Google Workspace Directory API
- personnel/admin roster management
- Drive permission changes
- Apps Script project ownership transfer
- Work0030
