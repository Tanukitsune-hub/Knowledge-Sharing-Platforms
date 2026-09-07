# Work 0028 — final Light correction decisions

WORK_ID: 0028
STATUS: DESIGN DECISIONS CLOSED FOR NEXT DISPATCH

この文書はDraft PR #43に対するユーザーレビュー後、次回のfresh Codex dispatchで反映するLight最終修正事項を固定する。

## Sidebar

ユーザー向けsidebarはグループ見出しを表示しない。`探す / 記録する / 振り返る / 設定する`は削除し、destinationをフラットに並べる。

最終候補:

- ナレッジ検索
- 記録を追加
- 過去の記録
- 面談先サマリー
- 面談実績の集計
- 面談と資料の関連
- プルダウンの管理
- 管理者ページ

名称変更:

- `Workspace` → `面談先サマリー`
- `マスター管理` → `プルダウンの管理`
- `AIプロバイダ設定` → `管理者ページ`
- standalone `面談履歴` と `面談活動の集計` → `面談実績の集計` に統合

内部page ID / handler / backend contract / GP・Entity read facade / provider/admin semanticsは名称変更により変更しない。

## 面談実績の集計 — final information architecture

Standalone `面談履歴`を廃止し、その月次個別Meeting確認機能を既存Activity Analyticsへ統合する。新backend、新dataset、新endpointは作らない。

### 1. 集計条件

ページ上部はcompactな1 cardとする。

主要control:

- 期間単位
- 対象月または開始日/終了日
- 内訳
- 集計action

`期間単位 = 月次` の場合はYYYY-MMの対象月selectorを表示し、開始日/終了日の重複表示を避ける。将来productionでは対象月を当月1日〜末日のexisting date-range contractへ変換する。

月次以外ではexisting period/date semanticsを維持する。

既存の任意filter:

- 面談先区分
- 面談先
- 関連GP
- Asset Class
- Team
- Meeting Type
- Status

は`詳細条件` disclosureへまとめる。既存filter contractは変更しない。

### 2. Compact summary

large KPI cardを避け、横一列のcompact summaryを基本とする。

優先表示:

- 面談件数
- 面談先数
- 要フォロー件数

`Active`集計値はunderlying dataとして維持するが、headline必須項目とはしない。必要なtable等では表示可。

### 3. 期間別推移

wide desktopを活かし、`期間別面談件数グラフ | 期間別数値表`を横並びにする。

グラフは傾向把握、数値表は正確な値の確認に使う。同じunderlying seriesを表示し、矛盾する別集計を作らない。

### 4. 選択した内訳

`内訳グラフ | 内訳表`を横並びにする。

内訳dimensionはcurrent Activity Analytics contractをそのまま使う。新しいdimensionや推定分類は追加しない。

### 5. 個別面談一覧

ページ下部に、選択条件へ一致するindividual Meeting一覧を表示する。

月次の場合の見出し例:

`2026年8月の面談`

ユーザー向け列はtechnical ID中心にせず、次を優先する:

- 日付（Meeting IDは補助表示可）
- 面談先
- Asset Class
- Team / 面談種別
- Fund / Strategy
- 原資料
- 確認済み

`原資料`はexisting documentUrl/fileUrl相当のsource actionが存在する場合だけ`原資料を開く`として表示する。

### 6. 月次の事務チェック

既存`adminCheckCompleted`は、当該Meetingを月次事務で確認・反映済みかを示す保存済みcheck flagとして扱う。

独立した管理者向けcardは作らず、月次個別Meeting一覧の右端に`確認済み`checkbox列を置く。

要件:

- checkbox ON/OFFは保存される
- 後からいつでも変更可能
- existing `updateMeetingAdminCheck` / `adminCheckCompleted` / concurrency-related existing contractを再利用
- new backend / dataset / workflowを作らない

既存権限条件がある場合はその条件を維持し、designだけで通常ユーザーへmutation権限を拡張しない。

## 面談先サマリー

旧`Workspace`のユーザー向け名称は`面談先サマリー`とする。

GPとnon-GP Entityを1つの入口で見るPR #43の統合設計は維持する。GP/non-GPでexisting read facadeを使い分ける境界、Fund / Strategy、Meeting、Pitchbook、relation、timeline等の既存表示意味は変更しない。

## Visual decisions preserved

次回Light修正でもPR #43までに固定した以下を再検討しない。

- persistent left sidebar
- desktop-first wide workspace
- sidebar `#182124`
- cool light slate page / white cards / cool borders
- restrained gold
- local thin-line SVG icons
- dense clean sayagata
- active menu left strip only `#E1001F`
- other ordinary UI `#E1001F` = none
- normal-user Knowledge Search: one model/profile selector, no visible Thinking
- current Gemini qualified-disabled / normal-user hidden
- compact Meeting/Pitchbook/summary layouts
- future Dark chart surface `LIGHT_FIXED`

## Next gate

次回はfresh Dispatch ID `0028-CODEX-07`を使用する。Returned CODEX-06へ追記しない。

CODEX-07はこの文書のclosed decisionsをPR #43 visual baselineへ反映するdesign-only final Light correctionとする。

Production implementation / Dark / deploymentはまだ未許可。
