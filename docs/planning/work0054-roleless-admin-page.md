# Work 0054 — Roleless Admin Page plan

WORK_ID: 0054
STATUS: PLANNED
MODE: BUILD
DEPENDENCY: Work0053 ACCEPTED
ACTIVE_DISPATCH: NONE
BALL: NONE

## Primary Outcome

`管理者ページ` を機能グループとして維持しながら、特定accountを「管理者」として扱うapplication-level role modelだけをなくす。

## Fastest Safe Decisive Action

1. current 管理者ページ / AI設定 / 削除記録 / Themeのauthorization pathsをinventory
2. account-level role gateとGoogle-side/infrastructure protectionを分類
3. ordinary Web App feature accessに使われるadminEmails / role gateだけを除去
4. `管理者ページ` のlabel/navigation/tab構造は維持
5. Work0051 backup operatorがrolelessのまま維持されることを確認
6. shared-admin password/session codeは「現在必要か」を分類し、不要でも大規模削除は避ける
7. browser/server regression
8. target-runtime qualification

## Closed UI decision

```text
ADMIN_PAGE_NAME: KEEP
ADMIN_PAGE_NAVIGATION: KEEP
RENAME_TO_SETTINGS: NO
ACCOUNT_LEVEL_ADMIN_ROLE: NONE
EQUAL_WEB_APP_FEATURE_PERMISSION: YES
```

## Deferred option

`管理者ページ`を開く際の共通password gateは将来option。

Work0054では実装しない。
最終rollout付近で必要性を再判断する。

## Non-goals

- administrator account roster
- personnel handover UI
- Google Workspace Directory API
- deployment access broadening
- Drive permission changes
- Apps Script project ownership transfer
- admin-page shared password implementation
- Work0030
