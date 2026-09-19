# Work 0039 — 月次面談確認フロー復元計画

WORK_ID: 0039
STATUS: PLANNED
MODE: BUILD

## Primary Outcome

面談実績の集計の`該当Meeting`一覧だけで、事務担当者がMeeting Typeを日本語で判別し、各Meetingの`確認済み`checkboxを操作すると即時保存される状態へ戻す。

## Recommended product behavior

### 該当Meeting table

現在の`Team / Type`を分け、少なくとも次を明示する:

- 日付
- Meeting ID
- 面談先
- Team
- Meeting Type
- Status
- 原本
- 確認済み

Meeting Typeはcanonical labelで表示:
- 定例年1回
- 先方オフィス訪問
- 年次総会

複数typeなら複数labelを表示。未設定は`未設定`。

### 確認済みcheckbox

各drill recordの`adminCheckCompleted`をcheckbox stateへ直接bind。

checkbox change時:
1. checkboxを一時disabled
2. existing `updateMeetingAdminCheck`をcall
3. `expectedAdminCheckCompleted` + `expectedAdminCheckUpdatedAt`でoptimistic concurrency
4. successならrow stateを更新
5. stale/errorならserver stateを再読込し、errorをinline表示

結果は既存Meeting_Index `Admin_Check_*`へ自動保存。新規保存先は作らない。

### 月次業務との関係

checkbox自体は`該当Meeting`一覧へ常時表示する。

理由:
- current analyticsは1-year defaultであり、single-month条件にすると通常利用から消える。
- admin stateはMeeting単位のmetadataであり、backend上はrangeに依存しない。
- 事務担当者はdate range / periodを1か月へ絞れば、その月だけを確認できる。

OPTIONAL UI convenienceとして、後から`確認対象月`month shortcutを追加してdateFrom/dateToを1か月へ設定してもよいが、primary repairには不要。

### Legacy admin-check card

`activity-admin-check-card`はinline checkboxと重複するためnormal UIから撤去する。

backend responseの`adminChecks` / `adminCheckAvailable`は互換性のため当面残してよい。frontendからは利用しない。

### 原本column

現行rendererが右端に出している`Doc` linkは保持し、headerを`原本`として独立columnにする。

`月次管理`headerにDoc linkを出しているcurrent mismatchを解消する。

## Implementation direction

### Server/read model

`kspActivityMapMeeting_`へ`meetingTypeLabels`を追加する。

label sourceは`KSP_MEETING_TYPE_DEFINITIONS`を正本として再利用し、client側へ重複mappingを作らない。

既存:
- `meetingTypeCodes`
- `adminCheckCompleted`
- `adminCheckUpdatedAt`
- `adminCheckUpdatedBy`

は保持。

### Client

`activityRenderDrill`でcheckboxを直接描画。

`updateActivityAdminCheck`は`activityAnalyticsData.adminChecks`依存をやめ、`activityAnalyticsData.drill.records`から対象Meetingを解決する。

更新成功後はfull analytics reloadでもよいが、可能なら対象rowだけstateを更新して不要なscroll jumpを避ける。

### Page

`該当Meeting` table headerをrendererと一致させる。

legacy`activity-admin-check-card`はnormal presentationから削除または恒久hidden。

## Acceptance Evidence

1. source/logic:
- Meeting Type canonical labels
- checkbox binds to adminCheckCompleted
- expected timestamp concurrency preserved
- no normal Meeting Version/Updated/Doc mutation
- Audit metadata-only semantics preserved

2. deterministic tests:
- unchecked -> checked
- checked -> reload -> checked
- checked -> unchecked
- stale expected state fails safely
- 1-year date rangeでもcheckbox visible
- one-month rangeでもcheckbox visible
- Meeting Type 3 canonical labels
- Doc link under `原本` header

3. actual owner-only runtime:
- synthetic Meeting checkbox true -> reload -> false
- exact row persists
- Audit expected events
- Meeting Version/Updated/Doc unchanged
- 2560 / 1440 / 1280 / 390 responsive table
- console error/warn0

## Non-Goals

- schema/migration
- new monthly storage/table
- changes to Work0037 1-year analytics default
- provider changes
- public exposure
- historical data rewrite

## Dependency

Before implementation dispatch, finish/reconcile Work0038 PR #60 so main and served baseline are aligned.

## Dispatch

No Codex Dispatch yet. User review/approval of this repair plan first.
## User approval — 2026-09-20

User approved the restoration direction.

Implementation contract is now fixed subject only to baseline sequencing after Work0038:
- inline Meeting Type canonical labels in `該当Meeting`
- dedicated `原本` column
- rightmost `確認済み` checkbox on each Meeting row
- checkbox auto-save through existing `updateMeetingAdminCheck`
- existing optimistic concurrency + metadata-only Audit preserved
- checkbox visible regardless of one-year / one-month analytics range
- legacy separate admin-check card removed from normal UI
- no schema/migration/new storage

Work0039 implementation must start only after Work0038 PR #60 is merged and served baseline is reconciled.