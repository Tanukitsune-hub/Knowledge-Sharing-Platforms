# Work 0028 — final Light correction decisions

WORK_ID: 0028
STATUS: DESIGN DECISIONS CLOSED FOR NEXT DISPATCH

この文書はDraft PR #44に対するユーザーレビュー後、次回のfresh Codex dispatchで反映するLight最終修正事項を固定する。

## Strategy Reset — Light only

ユーザー明示判断により、Work 0028のtheme scopeを`Light / Dark / System`から`Light only`へ変更する。

保持するAccepted Evidence / Closed Conclusions:

- Work 0027 Gemini qualified-disabled / normal-user hidden
- Work 0029 shared-admin behavior
- Meeting / Pitchbook dataset・handler・validation・lifecycle分離
- GP / non-GP separate read-facade mapping
- Knowledge Search five modes / filters / citations / source identity / provider route semantics
- sidebar `#182124`、active left strip only `#E1001F`、cool Light workspace、white cards、cool borders
- selected Light familyのtechnical review evidence

変更するcompletion gate:

- Dark familyは作成しない。
- System themeも作成しない。
- theme selector、`prefers-color-scheme`、browser-local theme preference、Dark chart palette / `CHART_SURFACE_THEME: LIGHT_FIXED`はWork 0028のscopeから外す。
- Light familyのuser acceptance後、production BUILDはユーザーの明示許可だけを追加gateとする。
- production implementation / deploymentは引き続き未許可。

## Start surface / navigation reference

`Light navigation`はdesign review用referenceであり、productionのtop pageにはしない。

- Web App起動時は`ナレッジ検索`から開始する。
- `Light navigation`というユーザー向けpage / destinationは作らない。
- design artifactとしてのnavigation overviewは残してよいが、production surfaceとして数えない。

## Sidebar — final Light polish

ユーザー向けsidebarはグループ見出しを表示しない。`探す / 記録する / 振り返る / 設定する`は復活させない。

最終destination:

1. ナレッジ検索
2. 記録を追加
3. 過去の記録
4. 面談先サマリー
5. 面談実績の集計
6. プルダウンの管理
7. 管理者ページ

`面談と資料の関連`は独立destinationから外し、`過去の記録`へ統合する。

### System-tool separator

`面談実績の集計`と`プルダウンの管理`の間に、system/tool領域を視覚的に区切るdecorative separatorを入れる。

要件:

- `プルダウンの管理`の上に約1行分の余白を置く。
- その余白内に1本のgold decorative ruleを置く。
- 両端は細く尖り、中央がわずかに膨らむ、細身で上品な形状とする。
- text group headingは追加しない。
- `プルダウンの管理`と`管理者ページ`を、通常業務destinationから視覚的に分けるためのpresentation cueとする。
- 外部runtime dependencyは追加しない。local SVG / CSSで表現する。

## Gold treatment — richer but restrained

現状の薄いflat goldを、Light family全体の品位を保ったまま少し深みのあるmetallic goldへ調整する。

対象の優先順位:

- 左上`Knowledge Share` brand
- sidebar icon family
- new decorative separator
- 既存の小さなgold rule / accent

方向性:

- champagne gold〜antique gold寄りの深みを持たせる。
- 1色flatだけでなく、ごく控えめなhighlight / shade / gradientを許容する。
- 強い鏡面反射、派手なglow、アニメーション、過度な3D表現は使わない。
- nav label本文の可読性を優先し、文字全体を派手なmetallic treatmentにはしない。
- SVG iconはthin-line familyを維持しつつ、必要ならstroke gradient等で僅かな金属感を与える。
- contrastの数値PASSはstatic designだけでは主張しない。production前のaccessibility qualification対象とする。

## 面談と資料の関連 — 過去の記録へ統合

現行Relationship Explorerの主旨とbackend/read contractは維持し、独立pageだけを廃止する。

関係の正本は引き続き`Meeting_Index.Related_Pitchbook_IDs`に保存された明示的Document IDである。GP名の一致から関係を推定しない。

### 過去の記録 / 資料

既存Pitchbook listをprimary surfaceとして維持し、各資料に`関連面談`を追加する。

推奨表示:

- list columnまたはcompact secondary actionとして`関連面談 n件`
- 選択時に、そのDocument IDを明示的に参照するMeetingをinline / row detailで展開
- related Meetingの優先情報: 日付、面談先、Meeting Type / Fund Strategy、原資料への導線

既存のPitchbook検索・edit・Inactive/Reactivate・source actionは維持する。

### 過去の記録 / 面談

各Meetingに`関連資料 n件`を表示し、選択時に`Related_Pitchbook_IDs`の解決結果を展開する。

- resolved / Inactive / unresolved relationshipを既存semanticsどおり保持
- source URLがある資料は`原資料を開く`
- 関係の追加・削除は既存Meeting registration/edit contractで行い、Past Records listに新しいrelation mutation workflowは作らない。

### Backend boundary

- existing Relationship Explorer read logicを再利用・再配置する想定
- new database / sheet / relation model / endpointは作らない
- Meeting / Pitchbook datasetを統合しない
- GPはfilter / presentation軸として利用できるが、relation判定は明示IDのみ

## 面談実績の集計 — final information architecture

Standalone `面談履歴`を廃止し、その月次個別Meeting確認機能をexisting Activity Analyticsへ統合する。新backend、新dataset、新endpointは作らない。

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

GPとnon-GP Entityを1つの入口で見る統合設計は維持する。GP/non-GPでexisting read facadeを使い分ける境界、Fund / Strategy、Meeting、Pitchbook、relation、timeline等の既存表示意味は変更しない。

## Visual decisions preserved

次回Light修正でも以下は再検討しない。

- persistent left sidebar
- desktop-first wide workspace
- sidebar `#182124`
- cool light slate page / white cards / cool borders
- local thin-line SVG icons
- dense clean sayagata
- active menu left strip only `#E1001F`
- other ordinary UI `#E1001F` = none
- normal-user Knowledge Search: one model/profile selector, no visible Thinking
- current Gemini qualified-disabled / normal-user hidden
- compact Meeting/Pitchbook/summary layouts
- Work 0027 / 0029 accepted contracts

## Next gate

次回のfresh Dispatch IDは`0028-CODEX-08`。Returned CODEX-07へ追記しない。

CODEX-08はPR #44をreview historyとして保持し、この文書のclosed decisionsを反映するdesign-only final Light polishとする。

Light familyのuser visual acceptanceが得られたらLight design phaseへCompletion Latchを適用する。Dark / System familyは作成しない。

Production BUILDはLight acceptance後にユーザーが明示許可した場合のみStrategy Resetして開始する。Deploymentは別scopeのまま。
