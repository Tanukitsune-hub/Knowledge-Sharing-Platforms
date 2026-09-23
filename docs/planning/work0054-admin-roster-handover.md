# Work 0054 — Administrator roster / personnel handover plan

WORK_ID: 0054
STATUS: PLANNED
MODE: BUILD
DEPENDENCY: Work0053 ACCEPTED
ACTIVE_DISPATCH: NONE
BALL: NONE

## Primary Outcome

人事異動に耐えるadministrator roster管理とhandover flowを実装し、初回installer個人への恒久依存をなくす。

## Fastest Safe Decisive Action

1. current admin authorization surfacesをinventory
2. `adminEmails` authoritative state / mirror / installer-owner latchの関係を整理
3. admin roster mutation serviceをserver-sideで実装
4. Admin pageへ最小の管理者一覧 + add/remove UI
5. last-admin protection / successor-first handover
6. installer-owner decoupling / recovery contract
7. audit + tests
8. owner-only target-runtime qualification

## Non-goals

- Google Workspace Directory API / Google Group membership integration
- IAM / organization-wide RBAC
- deployment owner auto-transfer
- permission broadening
- Work0030
