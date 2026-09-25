# Work 0071 — Interaction-stable async UX

WORK_ID: 0071
DISPATCH_ID: N/A
BALL: NONE
STATUS: PLANNED
MODE: BUILD
VALIDATION_TIER: TIER_2_STANDARD
ROUTE: A -> C when implementation starts

## Primary Outcome

保存・upload・検索・集計等の非同期処理に伴うstatus/file metadataの表示変更で、主要actionや入力位置が不意に移動しないapp-wide interaction modelへ収束させる。

## Product Direction

Canonical direction:

`docs/product/interaction-stability-and-layout-shift.md`

## Initial Scope

第一優先:

1. 記録を追加4 source
2. shared file upload / retry
3. 過去の記録 edit/lifecycle

そのpatternを確立後、Decision-Impact Gateを通ったsurfaceだけへ展開する。

候補:

- Knowledge Search / Full Output
- Activity Analytics
- Master / 管理者ページ
- other async refresh surfaces

## Core Acceptance

- primary action position / sizeはnormal busy/status transitionで実質不変。
- transient statusはreserved / anchored regionで更新し、new row insertionでpageを押し下げない。
- file listはsaved filename追加やstatus changeでaction positionを押し下げない。
- long filename / 1 file / max file count / busy / success / error / retryを検証。
- unexpected scroll / focus loss 0。
- accessibility status semantics維持。
- desktop + 390px。
- business logic / schema / provider contract unchanged unless separate concrete needが発生。

Geometry acceptance候補:

```text
PRIMARY_ACTION_SHIFT_X <= 1 CSS px
PRIMARY_ACTION_SHIFT_Y <= 1 CSS px
NORMAL_STATUS_LAYOUT_JUMP: 0 material movement
```

Work開始時にactual before measurementを取り、1px基準がplatform rendering上妥当か確認して最終固定する。

## Boundaries

- Work0070をblockしない。
- current Work0070 source/runtime evidenceを再度開かない。
- backend/schema/provider変更はdefault non-goal。
- safety retry / unknown-outcome / partial-success informationを削除しない。
- fake progress percentageを導入しない。
- fullscreen overlayをnormal mutationのdefaultにしない。

## Routing When Authorized

実装時は新しいDispatch IDを発番する。

Rendered frontend behaviorがPrimary Outcomeなので、actual browser interaction evidenceを含むTIER_2_STANDARDをdefaultとする。もしshared state/concurrency等へ踏み込む変更が必要になった場合のみTIER_3へStrategy Resetする。

## Current State

Planning only。implementation未開始。

```text
BLOCKER: NONE
DEPENDENCY: Work0070 ACCEPTED baseline
NEXT_ACTION: after Work0070 completion, inspect actual UI and freeze smallest shared pattern
```
