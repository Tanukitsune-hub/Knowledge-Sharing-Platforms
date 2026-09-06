# Work 0028 — CODEX-05 refinement amendment 01

WORK_ID: 0028
DISPATCH_ID: 0028-CODEX-05
BALL: CODEX
STATUS: READY
MODE: INVESTIGATION
PHASE: A1.7 / LIGHT FAMILY REFINEMENT / DESIGN ONLY

このamendmentは `docs/handoffs/0028-CODEX-05-light-family-refinement-instruction.md` に追加して従う最新のユーザー指示である。既存instructionと矛盾する場合、本amendmentの明示内容を優先する。production実装・Dark・deploymentは引き続き禁止。

## 1. 面談先 quick-add の横並び

Meeting registration / editでは、`面談先` dropdownの横幅を少し詰め、その右側に既存の `未登録の面談先を追加` actionを同一rowで配置する。

- current sourceには `meeting-quick-add-counterparty` が既に存在する。
- 新機能を追加しない。既存actionのpresentationだけを変更する。
- 面談先valueが長くても極端に狭くならないよう、dropdownをflex-grow、buttonを内容幅とする。
- 1366px desktopで縦スペースを節約し、narrow fallbackでは自然に縦積みへ戻す。

## 2. ナビゲーション統合 — 登録系

現行のトップレベル `面談を記録` と `資料を登録` を、visual navigation上は1つのdestination `登録する` / `記録を追加` に統合する案を採用する。

そのdestination内で、同一ページのsub-tab / segmented controlとして以下を切り替える。

- `面談`
- `資料`

重要:

- MeetingとPitchbookのform、handler、draft、retry、payload、file upload、保存先datasetは統合しない。
- DOM/page実装を将来どう再編するかはproduction BUILDで決める。今回のdesign artifactでは1つのuser-facing destinationとして表現する。
- sub-tab切替でdraft/inputを失う設計にしない。

## 3. ナビゲーション統合 — 過去記録系

現行トップレベル `過去の面談記録` と `過去の資料` は、visual navigation上1つのdestination `過去の記録` に統合する案を採用する。

同一destination内でsub-tab / segmented control:

- `面談`
- `資料`

を切り替える。

重要:

- MeetingとPitchbookを同一dataset/tableへ統合しない。
- それぞれのfilter、status、edit/delete/restore eligibility、source action、stable IDは現在のcontractのまま。
- navigationだけを簡素化する。

## 4. Meeting Type checkbox を必ずvisibleにする

Meeting registration / editで、既存の3つのMeeting Type checkboxを見える位置に配置する。

現行source contract:

- `ANNUAL_REVIEW` — 現行表示 `定例年1回`
- `OFFICE_VISIT` — 現行表示 `先方オフィス訪問`
- `ANNUAL_GENERAL_MEETING` — 現行表示 `年次総会`

ユーザー向け表示は、意味を変えずにより簡潔に次を第一候補とする。

- `年1面談`
- `オフィス訪問`
- `年次総会`

3項目は相互排他ではなく複数選択可能なcheckboxのまま。radioへ変更しない。

縦スペースを増やさないよう、desktopでは同一rowのcompact checkbox groupを基本とする。既存valueとpayload `meetingTypeCodes` は変更しない。

## 5. 指定年月の面談履歴 destination を表に出す

ユーザーは、特定の過去年月を指定し、その年月のMeeting履歴を一覧確認できる明確なタブ/導線を必要としている。

current sourceには専用navigation destinationはないが、既存機能として以下がある。

- Activity Analyticsの`monthly`期間
- dateFrom/dateTo
- `該当Meeting` drill table
- 1か月選択時の月次管理反映状態
- `searchMeetingRecords`のdate range filter

したがって新backendを作る前提にはしない。selected Light designでは、既存データ/検索契約を利用するuser-facing destinationとして `面談履歴`（仮称）をsidebarの `振り返る` groupに明示する。

第一案:

- top-level label: `面談履歴`
- first control: `年月`（YYYY-MMを直感的に選択）
- selected monthを既存dateFrom/dateToへ対応させるfuture FRONTEND_BEHAVIORとして設計
- primary result: その月のMeeting一覧
- 必要なら既存月次管理状態を同じcontext内に表示

これはAnalyticsそのものを削除・置換する指示ではない。`面談活動の集計` は期間推移・内訳分析の既存用途を維持する。

`面談履歴` と `面談活動の集計` の役割を明確に分ける:

- 面談履歴: 指定年月の個別Meetingを確認する日常業務画面
- 面談活動の集計: 件数・期間推移・内訳を分析する集計画面

もしdesign上、独立top-level destinationより `過去の記録` 内の第三sub-tab `月次面談履歴` の方が明らかに分かりやすい場合は、その案も比較してよい。ただし新しい3案ideationには戻らず、1つの推奨構成を決めてvisual familyへ適用する。

## 6. Sidebar destination count とicon整合

上記統合によりsidebarのトップレベルdestination数は減らす方向とする。icon familyも統合後のdestination単位で意味を合わせる。

目標構成イメージ:

### 探す
- ナレッジ検索

### 登録する
- 記録を追加（内部sub-tab: 面談 / 資料）

### 振り返る
- 過去の記録（内部sub-tab: 面談 / 資料）
- 面談履歴（指定年月）
- GP Workspace
- Entity Workspace
- 面談活動の集計
- 面談と資料の関連

### 設定する
- マスター管理
- AIプロバイダ設定

名称は既存の日本語task-oriented policyに合わせて微調整可。ただし機能を新設・削除したように見える誤解は避ける。

## 7. Validation追加

CODEX-05の既存validationに追加:

- Meeting registration/editで`未登録の面談先を追加`が面談先dropdownと同一rowにある
- Meeting Type 3 checkboxがvisibleで、複数選択可能な見せ方
- top-level Meeting/Pitchbook registration navigationは1 destination + 2 sub-tabsとして表現
- top-level Past Meeting/Pitchbook navigationは1 destination + 2 sub-tabsとして表現
- 指定年月のMeeting履歴へ到達できる明確なuser-facing destinationまたはsub-tabがある
- Monthly history designは既存date range / Activity Analytics / Meeting search contractにgroundされ、新backend capabilityを前提にしていない
- Activity Analyticsの既存分析用途は維持
- navigation統合で個別dataset semanticsを混同しない

Return reportには以下を追加:

```text
MEETING_QUICK_ADD_INLINE: PASS | PARTIAL | BLOCKED
MEETING_TYPE_THREE_CHECKBOXES_VISIBLE: PASS | PARTIAL | BLOCKED
REGISTER_NAV_CONSOLIDATED: PASS | PARTIAL | BLOCKED
PAST_RECORD_NAV_CONSOLIDATED: PASS | PARTIAL | BLOCKED
MONTHLY_MEETING_HISTORY_SURFACE: PASS | PARTIAL | BLOCKED
MONTHLY_HISTORY_BACKEND_REUSE: PASS | PARTIAL | BLOCKED
```

WORK_ID: 0028
DISPATCH_ID: 0028-CODEX-05
BALL: CODEX
STATUS: READY
