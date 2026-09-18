# 面談先マスター統合 — GP中心モデルの廃止

Status: ACCEPTED_DESIGN_DIRECTION
Work ID: 0031
Date: 2026-09-18

## Decision

Knowledge Sharing Platformsのentity modelをGP中心から面談先（Counterparty）中心へ移行する。

GPは独立したmaster/entity classではなく、面談先の種別の1つとして扱う。

Before:
- GP_Master
- non-GP counterparties in Option_Master
- Meeting.GP_ID
- Meeting.Counterparty_Type / Counterparty_ID
- Related_GP_IDs
- Pitchbook.GP_ID
- GP-specific UI/filter/summary

After:
- Counterparty_Master
- Meeting -> Counterparty_ID
- Material/Pitchbook -> Counterparty_ID
- GP = Counterparty_Type.GP

## Product meaning

「面談先」は組織・部署等のprimary entityを意味する。人物名・役職は従来どおりMeetingの「面談相手（氏名・役職）」で保持し、Counterparty Masterとは分ける。

Counterparty Type:
- GP / 運用会社
- LP / Asset Owner
- 日本生命
- グループ会社
- Consultant / Gatekeeper
- その他

## Primary UI

### 記録を追加

primary selectionは単一の「面談先」とする。

「面談先区分 -> 面談先」という2段階必須入力は廃止する。Counterparty Typeはmaster属性としてoption表示・filter・summaryで利用する。新しい面談先を追加する場合だけName + Typeを入力する。

### 関連GP

Meeting create/edit/searchの通常UIから「関連GP」概念を削除する。

Meetingのprimary organizationはCounterparty_ID 1つで表現する。複数組織が1Meetingに参加する一般化（Related Counterparties / many-to-many）は今回自動的に追加しない。必要性が確認された場合に別scopeで設計する。

### 過去の記録 / 検索 / 集計

primary dimensionはすべて「面談先」。GP専用filter/column/summaryは廃止し、必要ならCounterparty Typeで絞り込む。「GPサマリー」は「面談先サマリー」に統合する。

## Counterparty Master

`GP_Master` を `Counterparty_Master` に置き換える。

Fresh-install authoritative columns:
- Counterparty_ID
- Counterparty_Name
- Counterparty_Type
- Status
- Created_At
- Updated_At
- Created_By
- Updated_By
- Legacy_Source_Type
- Legacy_Source_ID

IDはentity typeに依存しないgeneric stable IDを使用する: `CP-000001`, `CP-000002`, ...

Counterparty_Type values:
- GP
- LP_ASSET_OWNER
- NISSAY_INTERNAL
- GROUP_COMPANY
- CONSULTANT_GATEKEEPER
- OTHER

`Legacy_Source_Type` / `Legacy_Source_ID` はschema7からのmigration provenance専用で、normal product logicは依存しない。

## Option Master

Option_MasterはAsset Class / Equity-Debt / Location / Team等の汎用選択肢に限定する。既存 `COUNTERPARTY_*` option rowsはCounterparty_Masterへmigrationし、normal UI/catalog sourceとして使用しない。

## Meeting Index

新しいauthoritative identityは `Counterparty_ID`。

Counterparty name/typeはCounterparty_Masterからresolveする。`GP_ID`, `Related_GP_IDs`, legacy `Counterparty_Type` はmigration compatibilityへ降格し、新しいbusiness logic/new writesの正本にしない。

## Material / Pitchbook Index

資料もGP専用にしない。standalone materialのprimary organizationはCounterparty_ID。Meetingに添付された資料はparent MeetingのCounterparty_IDを継承する。

GP_ID / Related_GP_IDsはnew behaviorから外す。ファイル名/sequence ruleでGP名に依存している箇所はCounterparty nameへ一般化する。

## Search / AI metadata

entity filterはgeneric Counterparty identityへ統一する。推奨canonical entity keyは `COUNTERPARTY:CP-000001`。Counterparty Typeは別attribute/filter。

normal product contractから `GP:<id>` primary key、gpId primary filter、relatedGpId primary filter、Related GP output line、GP-only catalog assumptionを削除する。

## Analytics / Summary / Admin

- `GP Master` -> `面談先マスター`
- `GPサマリー` -> `面談先サマリー`へ統合
- GP-only analytics dimension -> Counterparty / Counterparty Type
- quick add -> Counterparty Masterへ登録

## Migration

schema7 -> schema8のidempotent migrationを用意する。

1. GP_Master recordsをCounterparty_Type=GPとしてCounterparty_Masterへ移行。
2. Option_Masterの既存non-GP counterparty rowsをCounterparty_Masterへ移行。
3. generic `CP-*` IDを割当。
4. Meeting/Pitchbookのexisting Counterparty/GP referencesをCP IDへrewrite。
5. legacy source mappingをCounterparty_Masterのprovenance columnsへ保存。
6. normal catalogs/search/UIがCounterparty_Masterだけを読むことを確認。
7. migration再実行でduplicate0。
8. existing Meeting_ID / Document_ID / Drive File IDは変更しない。

## Invariants

- Backend baselineは5 sheetsを維持し、GP_Master slotをCounterparty_Masterへ置換する。
- stable Meeting_ID / Document_ID / Drive File IDを維持。
- relation-only mutationでMeeting Docsを再生成しない。
- physical deleteなし。
- migrationはidempotent。
- provider calls0 / AI sync disabledでqualification可能。
- Work 0030は明示再開までDEFERRED。

## Non-goals

- 1Meetingに複数primary counterpartiesを持たせるmany-to-many設計。
- people/contact master。
- CRM化。
- company rollout。
- Azure provider transition。