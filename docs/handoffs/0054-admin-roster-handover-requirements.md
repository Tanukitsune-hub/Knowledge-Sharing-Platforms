# Work 0054 — Administrator roster and handover requirements

WORK_ID: 0054
STATUS: PLANNED
MODE: BUILD
DEPENDENCY: Work0053 ACCEPTED
ACTIVE_DISPATCH: NONE
BALL: NONE

## Primary Outcome

Private Assets Intelligenceの管理者権限を特定個人や初回導入者へ固定せず、異動・退職・担当交代時に安全に引き継げる運用へする。

## Role model

Separate:
1. system/deployment owner
2. operational administrators

Operational administrator authorization source:
- current installation/config `adminEmails` roster
- multiple administrators supported
- no hard-coded email in source

The installer-owner latch is not the long-term operational administrator roster.

## Administrator management

Admin pageに管理者一覧を管理するowner/admin-only surfaceを追加する。

Required actions:
- current administrators list
- add administrator
- remove administrator
- normalize lowercase / trim / deduplicate
- at least one administrator must remain
- cannot remove the last administrator
- changes require current authorized administrator
- all changes audited without exposing unnecessary personal data in GitHub/logs

Recommended handover flow:
1. current admin adds successor
2. successor signs in and administrator access is verified
3. predecessor is removed
4. optional deployment/system-owner transfer is handled separately if the deployment owner itself changes

## Authorization safety

- normal users cannot edit administrator roster
- server-side authorization mandatory
- do not trust hidden UI alone
- fail closed when active identity is unavailable
- administrator change must not rely solely on effective-user fallback
- permission/access broadening outside app-admin role is out of scope

## Installer-owner decoupling

Existing installer owner latch must not permanently block an administrator handover.

Design a bounded migration/recovery rule so:
- operational admin roster may change independently
- setup/repair remains protected
- old installer owner need not remain forever in `adminEmails`
- ownership transfer/recovery is explicit and auditable

## Long-lived ownership

Document recommended operational model:
- preferred: stable departmental/system Google Workspace account as deployment owner if company policy permits
- otherwise: documented ownership-transfer runbook
- Google Group based membership may be a future option, but do not add Admin SDK / Directory API scopes in this Work unless explicitly approved

## Acceptance Evidence

- 2+ admins supported
- successor can be added and authorized
- predecessor can be removed after successor verification
- removed admin immediately loses admin-only action authorization
- last-admin removal blocked
- installer-owner and operational-admin concepts separated
- Work0051 manual backup operator follows current roster automatically
- AI/admin configuration actions use the same current roster semantics where applicable
- normal-user UI unaffected
- schema/provider/permission broadening 0 unless separately approved
