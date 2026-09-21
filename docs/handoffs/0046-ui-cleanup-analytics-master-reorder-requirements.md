# Work 0046 — user-facing cleanup + analytics tabs + staged master reorder requirements

WORK_ID: 0046
STATUS: ACTIVE
MODE: BUILD
DEPENDENCY: Work0045 ACCEPTED
ACTIVE_DISPATCH: 0046-CODEX-01
BALL: CODEX

## Primary Outcome

Work0045完了後のKnowledge Shareについて、ユーザーが日常的に触れる画面から不要な内部情報とFollow-up表示を除去し、面談先サマリーと面談実績の集計を読みやすく整理する。あわせてマスター管理の並べ替えを即時保存から明示保存へ変更し、連続drag操作のテンポを改善する。

## Closed user decisions

### 1. Internal ID visibility

User-facing surfaceから面談先内部管理IDを表示しない。

対象例:
- `CP-000008`
- `COUNTERPARTY:CP-000008`
- Counterparty IDを付加したselect label
- 面談先サマリーheader / identity text
- Activity Analytics上の面談先表示

内部value / API / relation keyとしてのIDは維持する。

### 2. IDs explicitly preserved

以下は管理・照合用途があるため表示を維持する。

- Meeting ID
- Document ID

このWorkで隠さない。

### 3. Follow-up UI removal

`要フォロー` / `Follow-up` / `Follow-ups` に関するuser-facing表示を横断的に一掃する。

対象:
- 過去の記録一覧のbadge / filter surface
- 面談先サマリーsummary
- Fund / Strategy集計列
- follow-up list / Mixes / Follow-ups表現
- print / PDF view
- Activity Analytics breakdown / period tables
- Activity Analytics Meeting一覧badge
- その他visible text / heading / hint

Backend compatibility:
- existing `followUpRequired` / `followUpNote` data
- schema
- stored values
- historical records
は削除・migrationしない。

表示削除を理由に既存follow-up値をfalse/emptyへ上書きしない。

### 4. 面談先サマリー

Summary cardsは3つに整理する。

```text
面談件数 | 保存資料数 | 最後の面談日
```

Mapping:
- Meetings → 面談件数
- Pitchbooks → 保存資料数
- Latest → 最後の面談日
- 要フォロー → 削除
- Relationships → 削除

Cards:
- equal height
- equal padding
- label baseline aligned
- value baseline aligned
- desktopは3等分
- mobileはaccepted responsive behaviorへ自然にstack

User-facing labelsは可能な範囲で日本語化する。
例:
- Meetings → 面談記録
- Pitchbooks → 保存資料
- Activity timeline → 活動履歴
- Entity Workspace → 面談先サマリー

`Fund / Strategy`、`Status`、Meeting ID、Document IDなど業務上の固定語・識別子は別途明示指示がない限り維持してよい。

### 5. 面談実績の集計

Top card title:
- `Activity Analytics` → `面談実績の集計`

Top filter card直下に2 tabを追加。

```text
グラフ | 面談一覧
```

Default:
- グラフ

グラフtab:
1. 選択した内訳
2. 集計サマリー

面談一覧tab:
- 現在の`該当Meeting`

Data fetch / aggregationはtab切替で再実行しない。
同一取得結果の表示領域だけを切り替える。

Follow-up列・badgeは削除する。

### 6. Master reorder save flow

現在のdrag/drop即時server saveを廃止する。

対象:
- アセットクラス
- 面談場所
- チーム

Flow:
1. drag/dropはclient-side draft orderだけ更新
2. 何回でも連続でdragできる
3. 未保存状態をvisibleに表示
4. `並び順を保存` buttonで確定
5. 保存成功後に初めてserver canonical orderを更新

Counterparty tabはreorder対象外のまま。

## Master reorder detailed behavior

### Draft ownership

ASSET_CLASS / LOCATION / TEAMごとに独立したdraft orderを持つ。

Tab switching:
- 未保存draftを保持する
- tabを切り替えても自動保存しない
- 戻ったときdraft orderを復元する

### Save button

Active reorderable tabに:
- `並び順を保存` primary button
- changeなしではdisabled
- save中はdisabled + busy state
- success後はdisabledへ戻る

Optional secondary action:
- `変更を元に戻す`
- current server canonical orderへactive tab draftだけ戻す

### Persistence

Saveは1回のuser actionでactive tabのcomplete ordered ID listをserverへ送る。

Preferred server contract:
- batch reorder / complete order replace
- one server RPC
- one lock / deterministic write
- partial saveを避ける

1 drag = 1 RPC の現行挙動は廃止する。

### Conflict / mutation safety

未保存reorder中に同じtabで:
- add
- rename
- deactivate/reactivate
などcanonical listを変えるmutationが発生する場合、draftをsilentに上書きしない。

最小安全案:
- reorder draft dirty中はこれらmutation actionをdisableする
または
- 明示確認後にdraft破棄

実装時は最も単純で予測可能な方式を選ぶ。

`再読込`はdirty draftがある場合に明示確認を出す。

## Counterparty ID masking scope

Visible text acceptance:
- normal user-facing UI上で `CP-\d+`
- `COUNTERPARTY:CP-`
が表示されない。

Allowed:
- option.value
- data attributes
- RPC payloads
- internal JS state
- server logs/tests
- hidden backend contracts

## Non-goals

- Meeting ID非表示化
- Document ID非表示化
- follow-up data deletion / migration
- backend schema cleanup
- Relationship backend model removal
- analytics aggregation redesign
- Counterparty ID format変更
- Work0030 provider work

## Acceptance Evidence

### A. Follow-up visible-surface sweep

All 7 normal pages + print/PDF surface:
- visible `要フォロー`: 0
- visible `Follow-up` / `Follow-ups`: 0

Hidden/internal backend values may remain.

### B. Counterparty ID visible-surface sweep

All relevant selectors / summary / analytics / maintenance:
- visible `CP-000...`: 0
- visible `COUNTERPARTY:CP-`: 0

Meeting ID / Document ID remain visible where currently required.

### C. Entity summary

- summary cards exactly 3
- labels exact:
  - 面談件数
  - 保存資料数
  - 最後の面談日
- equal card heights at desktop viewports
- no Follow-up / Relationships summary cards
- Counterparty internal ID not visible

### D. Analytics tabs

- title `面談実績の集計`
- tabs exactly `グラフ`, `面談一覧`
- default = グラフ
- keyboard accessible
- グラフ contains 選択した内訳 + 集計サマリー
- 面談一覧 contains 該当Meeting
- no refetch solely on tab switch
- follow-up columns/badges absent

### E. Master staged reorder

For ASSET_CLASS / LOCATION / TEAM:
- drag causes 0 server mutations
- multiple drag operations remain smooth
- dirty indicator appears
- one Save causes one server mutation
- reload after save preserves exact final order
- tab switch preserves unsaved draft
- Save disabled when no change
- Counterparty behavior unchanged

### F. Regression

- Work0045 theme settings preserved
- 7 pages nonblank
- 2560 / 1440 / 1280 / 390
- console material error/warn 0
- no schema/migration/provider/access change
- Work0030 remains DEFERRED_BY_USER
