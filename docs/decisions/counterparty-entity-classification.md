# Counterparty Entity Classification

Date: 2026-08-27

Status: Accepted

## Decision

Meetingの一次分類を、従来の必須`GP_ID`から次の2段階へ一般化する。

1. `Counterparty_Type` — 面談先区分
2. `Counterparty_ID` — 区分内の個別面談先

通常利用者の入力UIは、最初に面談先区分を選び、その区分に属する個別面談先を選ぶdependent selectとする。

固定区分:

```text
GP
LP_ASSET_OWNER
NISSAY_INTERNAL
GROUP_COMPANY
CONSULTANT_GATEKEEPER
OTHER
```

表示名:

```text
GP / 運用会社
LP / Asset Owner
日本生命
グループ会社
Consultant / Gatekeeper
その他
```

区分コードは検索、分析、AI metadata、migrationの安定契約なので、通常利用者が追加・名称変更するMasterにはしない。

## Master architecture

既存の5-sheet Backendを維持し、新しいEntity/Counterparty sheetは追加しない。

- `GP`の個別先は既存`GP_Master`を参照する。
- 非GPの個別先は、既存`Option_Master`へ次のTypeを追加して管理する。

```text
COUNTERPARTY_LP
COUNTERPARTY_NISSAY_DEPARTMENT
COUNTERPARTY_GROUP_COMPANY
COUNTERPARTY_CONSULTANT_GATEKEEPER
COUNTERPARTY_OTHER
```

各個別先はstable ID、mutable display name、Sort Order、Active / Inactiveを既存Option Master規則で持つ。通常利用者は既存Master Managementから追加、rename、reorder、deactivate、reactivateできる。非GP seedは実在部署・組織名を推測して作らず、実利用時に追加する。

Counterpartyの一意キーはID単独ではなく次のcomposite keyとする。

```text
Counterparty_Type + ":" + Counterparty_ID
```

このderived keyを`entity_key`としてAI metadataや比較対象識別に使用できる。表示名が同一でも区分が異なれば別の業務コンテキストとして扱う。将来、複数区分を1組織へ統合する必要が実利用で確認された場合のみalias/canonical entity設計を別Decisionで追加する。

## Meeting schema evolution

`Meeting_Index`へappend-onlyで追加する。

```text
Counterparty_Type
Counterparty_ID
Related_GP_IDs
```

既存列は削除・reorderしない。

既存`Counterparty`列は組織を表す列に変更しない。引き続き個人名・役職等の自由記述を保持し、UI表示名を`面談相手（氏名・役職）`へ明確化する。

既存`GP_ID`列は互換性のため保持する。

- GP面談: `Counterparty_Type = GP`、`Counterparty_ID = GP_ID`、既存`GP_ID`も同じ値を保持する。
- 非GP面談: `GP_ID`はblankを許容し、Counterparty fieldsを正本とする。
- Legacy GP面談: migrationでblankの新規列だけを`GP / existing GP_ID / existing GP_ID`へbackfillする。

`Related_GP_IDs`はcanonical comma-separated stable GP IDsとする。

- GP面談ではprimary GPを必ず含める。
- 非GP面談では0件以上の関連GPを任意選択できる。
- legacy blankは有効。
- unknown code、duplicate、invalid IDはwrite時にfail closedとする。

## Meeting input contract

Prospective required fields:

```text
Date
Counterparty Type
Counterparty Entity
Asset Class
```

`GP`は全Meeting共通の必須項目ではない。

- `Counterparty_Type = GP`の場合、Counterparty IDはActive GP Masterから必須選択する。
- その他の区分では、対応するActive Option Master Typeから必須選択する。
- 既存Inactive entityはhistorical edit/readで保持・表示する。

`Counterparty` free textは個人名・役職・参加者等を表す任意項目として残す。

## Filename and Meeting Doc

新規Meeting filenameの組織segmentは、GP固定ではなくselected Counterparty display nameを使用する。

```text
YYYY-MM-DD_Counterparty_AssetClass_Equity-or-Debt_MTG-XXXXXX
```

Meeting Google Doc metadataは次を使用する。

```text
面談先区分
面談先
関連GP（存在する場合）
面談相手（氏名・役職、存在する場合）
```

既存Docの`GP:`表記はlegacy parserで読み続ける。Migrationは既存Doc本文やfilenameを一括rewriteしない。

## Shared draft behavior

Meeting / Pitchbook間で引き続き共有するもの:

```text
Date
Asset Class
Equity / Debt
Fund / Strategy
```

GP sharingはMeetingのCounterparty Typeが`GP`の場合のみ行う。

非GP面談からPitchbook画面へ移動した際に、Related GPの先頭値等を自動でPitchbook GPへ設定しない。意図しないmanager attributionを避けるためである。

## Meeting to Pitchbook candidate rule

既存のcanonical relationは`Meeting_Index.Related_Pitchbook_IDs`のままとし、新しいrelation sheetは作らない。

新規選択候補:

- Active Pitchbook
- selected Asset Classに一致
- Pitchbook `GP_ID`がMeeting `Related_GP_IDs`のいずれかに一致

GP面談ではprimary GPがRelated GPへ自動包含されるので従来動作を維持できる。

既存linkは、PitchbookがInactive、属性変更、または現在のcandidate条件外になってもedit/read時に保持する。Unresolved Document IDも黙って削除しない。

## Pitchbook boundary

このDecisionではPitchbookのrequired GP契約を変更しない。

- Pitchbook / source materialは引き続きDate、GP、Asset Classをrequiredとする。
- 非GP source-material ownershipの一般化は、実利用上の必要性が確認された場合のみ別Work/Decisionで扱う。
- AI metadata上はPitchbookを`entity_key = GP:<GP_ID>`としてgeneric entity filterへ参加させられる。

## Search, analytics, Workspace, and AI propagation

MeetingのCounterparty fieldsは次の全経路へ一貫して伝播させる。

- register / edit / retry / readback
- Past Meeting filters
- Meeting Docs
- Audit metadata（source bodyやFollow-up noteは除外）
- Knowledge Export
- activity analytics
- Entity Workspace
- AI source metadata

AI metadataのsingle-valued baseline:

```text
entity_key
counterparty_type
counterparty_id
counterparty_name
related_gp_ids
```

Pitchbookでは`counterparty_type = GP`、`counterparty_id = GP_ID`、`entity_key = GP:<GP_ID>`相当をderived metadataとして付与する。

Related GPは複数値になり得る。Gemini File Searchでのexact multi-value encoding/filter方式は、actual personal-PC Gemini qualificationでAPI behaviorを観測して決める。Comma-stringの部分一致をexact filterとして扱わない。

## Compatibility and migration

- schema migrationはforward-only、idempotent、append-onlyを原則とする。
- stable Meeting/GP/Pitchbook IDsを変更しない。
- existing records/files/counters/status/AI fields/user-mutated Mastersを保持する。
- legacy GP rowsはnew columnsがblankの場合だけbackfillする。
- existing Meeting Docs/filesをmigrationだけでrename/rewriteしない。
- normal read pathsはmigration完了前後のlegacy `GP_ID` fallbackをbounded期間サポートする。
- target-runtime qualificationで1件のlegacy GP Meetingと1件のnon-GP synthetic Meetingをcreate/reopen/searchし、source/Index/Audit/relationship integrityを確認する。

## Explicit non-goals

- follow-up owner/deadline/completion/reminder workflow
- static multi-GP comparison dashboard
- new Counterparty/Entity database sheet
- GP Master廃止またはstable GP ID変更
- Fund / Strategy Master
- automatic entity alias/merge
- Pitchbook non-GP source ownership
- production data migration/rollout

## Consequence for Work order

Activity analyticsをGP-only modelで先に作ると、直後にCounterparty Type/Entity軸へ作り直すため、Work orderを変更する。

```text
0016 Counterparty entity foundation
0017 Meeting activity analytics / monthly administrative checks
0018 Relationship Explorer
0019 Entity Workspace / Fund-Strategy drill-down
0020 Personal-PC Gemini / File Search core qualification
0021 Structured Knowledge filters / multi-entity comparison
```

Detailed plans are under `docs/planning/`.
