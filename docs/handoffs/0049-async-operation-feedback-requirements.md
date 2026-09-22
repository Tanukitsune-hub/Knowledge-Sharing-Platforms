# Work 0049 — 全アプリ非同期処理フィードバック標準化 requirements

WORK_ID: 0049
STATUS: PLANNED
MODE: BUILD
DEPENDENCY: Work0048 ACCEPTED
ACTIVE_DISPATCH: NONE
BALL: NONE

## Primary Outcome

Knowledge Shareの登録・追加・保存・変更・削除・復元・関連付け・同期など、ユーザーが待つ必要のある非同期処理について、「処理が開始された」「まだ処理中である」「完了または失敗した」が一貫して即座に分かるUIへ統一する。

現状すでに一部で使われている `status busy` spinner / button disable / `aria-busy` を共通のUX言語として全mutation surfaceへ展開する。

## User-observed gap

マスター管理 > アセットクラス等の追加では、初回submit時にbuttonはdisabledになるが、ユーザーに見える「登録中…」表示 / animationが出ない。

Current flow:
- duplicate submit防止は存在
- 2回目操作時に「選択肢を登録中です…」messageはある
- しかし1回目の通常処理中feedbackが不足

これは個別修正ではなく、全アプリ横断で解消する。

## UX standard

### 1. Button-level feedback

Userが押したaction buttonは処理開始直後に:
- disabled
- `aria-busy="true"`
- action-specific labelへ切替
- small spinnerをbutton内に表示

Examples:
- `追加` → `追加中…`
- `登録` → `登録中…`
- `変更を保存` → `保存中…`
- `並び順を保存` → `保存中…`
- `削除` → `削除中…`
- `復元` → `復元中…`
- `無効化` → `無効化中…`
- `再有効化` → `再有効化中…`
- `関連付ける` → `関連付け中…`
- upload/add materials → `資料を保存中…`
- provider connection → `接続確認中…`
- provider sync → `同期中…`
- qualification → `確認中…`

Original labelはsuccess/failure後に復元する。ただしsuccess後の画面遷移・modal close等でbutton自体が消える場合は不要。

### 2. Status-level feedback

各operationに既存status areaがある場合:
- `showStatus(id, 'info busy', '...中…')`
を処理開始直後に表示。
- completion: success message
- failure: error message

Modal内operationはmodal statusを優先し、page statusと二重に同じmessageを出さない。

### 3. Region-level feedback

対象form/card/dialogへ可能な範囲で:
- `aria-busy="true"`
- conflicting controls disabled

ただしpage全体を不必要にblockしない。

Local action:
- local card / modalだけbusy

Global-ish action:
- provider sync等、そのpanel全体をbusy

### 4. Animation

Existing spinner languageを再利用:
- 14–16px程度
- `currentColor`
- 約0.75s linear spin
- restrained / business UI向け
- no flashing
- no fake percentage/progress bar

`prefers-reduced-motion: reduce`ではanimation停止または静的indicatorへfallback。

### 5. No layout jump

Button spinner追加でbutton幅が大きく跳ねないようにする。
必要に応じて:
- min-width維持
- pseudo-element
- original label widthを基準

### 6. Request safety

Busy stateは見た目だけではなく:
- duplicate submit防止
- conflicting mutation prevention
と一致させる。

Busy開始は`await`前。
Busy解除は原則`finally`。

Error時にcontrolが永久disabledにならない。

## Required mutation inventory

少なくとも以下を実装・検証対象にする。

### Registration / Meeting / Materials
- 新規面談記録の登録
- 面談記録の編集保存
- 面談記録の削除
- 面談先quick add
- 関連資料追加 / upload
- 既存資料関連付け / 解除
- 資料metadata変更
- 資料無効化 / 再有効化

### Master management
- 面談先追加
- Option追加（Asset Class / Location / Team）
- Work0047 Master rename modal Save
- Master無効化 / 再有効化
- Work0046 staged reorder Save

### Admin
- 削除記録の復元
- Theme設定 Save / Reset（既存feedbackを維持・必要ならstandardへ合わせる）
- Provider connect / enable / disable / sync
- Model policy save / migrate / qualify

### Analytics
- 月次管理状態 / Admin Check update

### Knowledge / Export
- AI検索開始 / pending check（既存feedbackを維持）
- Full Output / export preview / Docs / PDF generation等のuser-triggered長時間処理

## Read-only operations

検索・loadについては、既存でspinner / busy表示があるものは維持する。

明らかに待ち時間が生じるread-only操作でfeedbackが欠ける場合は同じstandardを適用してよい。ただしmutation UX標準化を優先し、不要なanimationを増やさない。

Work0048の「削除記録は明示Search時のみ検索」を壊さない。

## Shared implementation preference

Ad-hocに各functionへ異なるspinner HTMLを埋め込むのではなく、既存の`.status.busy`を活かし、button busy stateのsmall shared helper / CSSを導入する。

Candidate contract:

```js
kspSetActionBusy(button, true, '追加中…')
kspSetActionBusy(button, false)
```

または同等のsmall helper。

Expected behavior:
- original textを安全に保存
- busy class / aria-busy / disabledを同期
- spinnerはCSS pseudo-element
- nested icon/textを壊さない
- repeated start/endでもidempotent

Generic helperはUI stateだけを担当し、serverCall / business logicを隠蔽しすぎない。

## Visual treatment

Recommended:
- button内spinner + action text
- adjacent status spinner where status area exists
- affected form/cardの軽いdisabled state

Avoid:
- full-screen blocking overlay for ordinary save/add
- fake progress %
- large modal spinner
- toastだけで処理中を表現
- colorだけに依存するbusy state

## Acceptance Evidence

### A. Global mutation inventory

A maintained test matrixで、対象mutation actionごとに:
- feedback appears before RPC settles
- trigger button disabled
- visible processing label present
- duplicate RPC blocked
- success restores/advances UI
- failure restores controls + visible error

### B. Master Option add decisive case

Asset Class / Location / Team:
- Add click直後に `追加中…` + spinner
- Add button disabled
- input / conflicting controls appropriately disabled
- one RPC only
- success message
- control recovery

### C. Button animation / accessibility

- shared busy button class exists
- spinner visible at normal motion
- reduced motion honored
- `aria-busy` correct
- no material button/layout jump at 1440 / 390

### D. Existing accepted flows preserved

- Work0046 staged reorder
- Work0047 rename modal
- Work0048 manual deleted-record search
- Work0045 theme settings
- provider security boundary
- no provider calls during unrelated UI qualification

### E. Runtime

- all 7 normal pages nonblank
- 2560 / 1440 / 1280 / 390
- representative mutation feedback screenshots/evidence
- console material error/warn 0
- schema/migration/permission changes 0

## Non-goals

- fake progress percentages
- backend job queue
- new notification framework
- toast system redesign
- server API redesign unless strictly necessary
- schema / migration
- Work0030
