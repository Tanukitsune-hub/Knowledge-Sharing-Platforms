# Work 0028 — CODEX-11前の全体整合性レビュー

WORK_ID: 0028
DISPATCH_ID: 0028-CODEX-11
BALL: CODEX
STATUS: READY
MODE: INVESTIGATION
PHASE: A1.15 / INTEGRITY-RECONCILED LIGHT CORRECTION / DESIGN ONLY

## 結論と証拠範囲

単一の記録登録・記録一覧に資料操作を集約する方向は維持する。ただし、これは単なるタブ削除ではない。GP以外の資料登録、親記録との関連確定、検索・引用属性、資料の削除、全文出力には後続BUILDで限定的な契約変更が必要である。

今回のChatGPT確認はGitHub上のコード・設計・返却情報のレビューであり、ローカルtestやApps Script実機の再実行ではない。過去の456 tests PASSは当該返却時の証拠としてのみ保持する。

- 確認時main: `f2d965c39ed2a1259d07aaff7aca8d60e6b68a8e`
- PR #46: `400f2f0e77acf81deb32e363d79a3962dfd2f017`、以前のcontroller technical review済みLight基準。
- PR #47: `d2efeff4d04d4c13dba6d0d72a707eacb9aabbe4`、CODEX-10名義の検索action修正返却。
- PR #48: `108a6e9002270ed0d4264991dd8971cff7cc663f`、CODEX-10名義の記録中心設計返却。新しい作業候補だが最終acceptではない。
- PR #47 / #48はDraft・open・unmerged。確認時mergeable=false。旧branchをmainへmerge/rebaseすることは今回の解決方法にしない。
- mainとPR #48の管理文書に時点差がある。CODEX-10は使用済みとして記録し、新指示はCODEX-11とする。2つの返却が同一runか別runかは確認できないため推定せず、過去IDを改番しない。
- PR #48の変更パスはdesign/docsとhandoff/controlのみ。production src/distに変更はない。

## 主要な確認結果

| 論点 | ソースで確認した事実 | 今回の判断・修正 |
|---|---|---|
| 最新要件とのずれ | PR #48の03/05に`記録種別`、`DATA_RECEIPT`、受領専用入力例が残る。main registryも旧案を残す | 単一フォーム・単一一覧へ修正。タブ、記録種別selector、受領専用form、独立資料画面は作らない。管理文書も同期する |
| 既存機能の脱落 | PR #48の登録例では関連GP入力が見えず、過去記録detailは資料中心で本文・面談原本の導線・記録削除が不足 | 関連GP、本文、原本、編集、記録削除/復元、資料分類編集等を配置先付きinventoryで確認。表示統合を機能の無断廃止にしない |
| GP限定 | 61はGP必須、62は`selected.gp.name`をファイル名に使用。150の引用source map、181の資料sourceもGP由来entityKey | ラベル変更/必須チェック解除だけでは不十分。親記録の実際のCounterpartyを登録・命名・検索・引用まで一貫して扱うfuture deltaを明記 |
| 親IDの必要性 | 現行Pitchbookは独立登録。71のuploadにparent Meeting_ID必須検証はない | 「既存機能」ではなく新要件。親の保存成功後だけ資料登録を許可。ブラウザが渡すIDだけを信用しない |
| 部分成功 | 71はファイル単位のidempotent replayを持つが、資料成功とMeetingへの関連確定は別処理 | `登録済み・関連付け未完了`を成功扱いしない。同じDocument_IDで関連付けだけ再試行。親や成功ファイルを作り直さない |
| 削除の意味 | 110のMeeting status変更と111のPitchbook status変更は別。単なるRelated_Pitchbook_IDs除去はPitchbook全体のInactive化ではない | 記録削除、当該記録からのunlink、資料全体のInactive、物理削除を分ける。通常資料buttonは`削除`、補足でこの記録との関連解除を説明 |
| 保存・原文保全 | 110の汎用Meeting更新はGoogle Docsの本文を組み立て直す | 添付だけの追加/解除で古いform全体を送って原文を上書きしない。関係変更の最小mutation、競合検出、Doc保全を後続BUILDの検証事項にする |
| 全文出力 | 155のfilter検証はcanonical knowledge validationへ入り、自由質問やmode条件と結合。156はDocs原文読出し・件数/時間制約を持つ | 非AIの独立button/validationへ分離。質問、AIモデル、preset、比較対象、面談準備targetを実行前提にしない。既存安全上限・原本検証は維持 |
| データ受領と集計 | 現行126のfilterにはrecord-kind識別がない | 受領だけの記録を通常の面談実績に無断混入させない。下記の未確定事項をBUILD前に閉じる |

### 「データ受領タブ不要」の解釈訂正

ユーザーが明示したのは、分岐やタブを増やさず単純な導線にすることである。その前には、資料のみの受領にも背景メモを持つ記録を作りMeeting_IDを発行する意向が示されていた。

前回答で「タブ不要」を「面談を伴わない受領そのものを登録禁止」と拡張した部分は、未確認の解釈であり確定要件から外す。ただし、この訂正を理由に受領専用画面、記録種別selector、DATA_RECEIPT schemaを復活させない。

CODEX-11では単一の通常登録フォームを作り、受領専用分岐も禁止メッセージも追加しない。受領だけの記録の扱いと面談集計への算入/除外は、後続BUILD前の確認事項として残す。面談3属性の全てが未選択でも通常面談はあり得るため、3属性から受領recordを推定しない。独立した資料uploadは引き続き許可しない。

## 整合させるfuture BUILD契約

以下はcontrollerの実装設計上の判断・推奨であり、現行productionで動作確認済みという意味ではない。

### 親記録・資料登録

- 新規は親の保存成功とauthoritative ID確定が先。フォーム上でファイルを選ぶことと、Drive/Indexへ登録することは別。選択は事前にできてよい。
- 過去の記録から追加するときは既存の編集可能な親を使い、新しいMeetingを作らない。
- prepare/upload/retryのserver側で同じ親contextを確認する。親不存在、Inactive、未保存、親差替え、競合を検出する。
- 登録元の親を追跡する情報と、現在有効なRelated_Pitchbook_IDsは役割が違う。必要なら既存Pitchbook行/予約に最小の登録元情報を保持する設計を検討し、消えたリンクから親を推測しない。列名・schemaはまだ固定しない。
- 親成功→資料upload成功→関連確定の状態を区別。関連確定失敗時の再試行は同じDocument_IDを再利用する。応答不明時はreadbackで確認してから再実行する。
- 元からある共有資料の複数Meeting関連を強制的な1対1へ変換しない。GP名・ファイル名の一致による自動関連付けもしない。

### 削除・検索対象・復元

- 当該記録の資料`削除`はunlink。ファイル、Document_ID、他の記録の有効な関連を破壊しない。補足文例:「この記録との関連付けを解除します。原本と他の記録との関連は残ります。」
- `元に戻す`/関係の復元はリンクの復元であり、Pitchbook全体を無条件Reactivateする操作ではない。元からInactiveの資料は別stateとして扱う。
- 新規の親必須資料については、通常検索可否を資料状態だけでなく有効な親との関連も含めて導出することを推奨する。最後の有効な関連を外したものや関連未確定の資料を、意図せず一般検索に残さない。他の有効な関連があればその文脈で維持する。
- 親をInactiveにしてもファイルをcascade physical deleteしない。親復元時もユーザーが明示的に解除したリンクを勝手に戻さない。
- eligibilityとmetadata変更は派生index/hash、検索候補、回答・引用のauthoritative照合に伝播させる。単なる画面非表示や表示後の引用削除だけを解決策にしない。既存providerの経路、strict citation validation、no-failoverは維持する。
- 履歴由来の親を持たない資料と、新処理の途中で未関連の資料を混同しない。前者を一括削除/Inactive化/再割当しない。

### 属性・検索・サマリー

- 新規資料の相手先contextは親のCounterpartyから取る。non-GPを仮GPで埋めない。分類の初期値は親から引き継ぎ、資料日付と面談日付、資料固有情報は混同しない。後日の追加で面談日を変更しない。
- 既存資料を別記録へ関連付けただけで資料の元の分類・相手先を上書きしない。共有資料の帰属はfuture contractで明示し、名前一致で同一視しない。
- 通常AI検索の`資料のみ`でも、そのnon-GPに紐付く適格な資料があれば検索対象にする。旧案の「non-GPなら0件でもよい」をGP限定バグの容認に使わない。
- Team/要フォロー/Meeting Type等のMeeting専用filterを資料へ無断拡張しない。未対応組合せは明示的に案内し、既存制約を隠して解除しない。
- `面談先サマリー`の既存GP/Entity read facadeは分離維持。文脈付き資料一覧は残せるが、資料単独の新規登録や独立管理画面を裏口で復活させない。新規資料の操作は親記録detailへつなぐ。
- 残すべき既存資料の分類編集等は、親detail内の補助操作へ移設する案を優先。ファイル差替えは追加しない。legacy orphanの管理導線は実データ調査後の限定移行課題であり、今回無断廃止しない。

### 全文出力

- 共通絞り込み（面談先・期間・Meetingに適用可能な詳細条件）に一致するActiveな記録のDocs全文と業務属性を出す。情報ソースselectorはAI検索用で、exportは常にMeeting-onlyと明記する。selectorの選択値や質問draftを勝手に変更しない。
- AI専用mode/contextを無視することを明記し、出力プレビューに実際の相手先・期間・対象件数を示す。選択条件を黙って全件に広げない。
- 空質問、未設定AI、未充足の比較/面談準備条件でも、共通filterが有効なら出力できる設計。架空質問を内部注入して古いvalidatorをすり抜ける実装にしない。
- 「全属性」は業務記録の属性。認証token、資格情報、provider内部状態JSON等を丸ごとdumpする意味ではない。source schemaから項目対応表を作り、ID/表示名/未設定を区別する。
- 既存preview/readback/fingerprint、件数・文字数・時間・重複生成防止の安全策を保持。上限超過や読出し失敗を黙って切り捨てて「全文」と表示しない。

## 分類と次の作業

- BLOCKER（最新Light案のaccept前）: PR #48の不要分岐、記録本文/操作の不足、unlinkとInactive復元の混同。CODEX-11の限定修正対象。
- FOLLOW_UP（production着手/利用認定前に必要）: 親binding・関連確定再試行・non-GP source metadata・検索eligibility・Docs原文保全・非AIexport validator・legacy移行・受領のみ記録と集計の扱い。CODEX-11では契約/テスト観点まで、実装しない。
- OPTIONAL: 新しい視覚言語、アイコン再選定、別テーマ、全データの大規模benchmark。実施しない。

既存の親作成/添付/検索が現行コードのまま成立する、または画面デモのPASSでfuture BUILDもPASSになる、とは判断しない。上記を固定してdesign-onlyの修正を開始することにはBLOCKERなし。

## 参照した主要ソース

main上の以下のコードと関連箇所を確認した。mainは`7ea55f5`以降docs-onlyの8 commitsで、既読のproduction sourceにも変更なしをcompareで確認。

- `src/00_Core.gs` schema、`src/30_MeetingCore.gs` relation/counterparty、`src/61_PitchbookValidation.gs`、`src/62_PitchbookIdentity.gs`、`src/71_PitchbookUploadService.gs`
- `src/110_MaintenanceMeetingService.gs`、`src/111_MaintenancePitchbookMasterService.gs`
- `src/126_ActivityAnalyticsService.gs` filter、`src/140_AiSourceModels.gs`、`src/150_KnowledgeSearchModels.gs` catalog/source map、`src/152_KnowledgeFilterContracts.gs`
- `src/155_KnowledgeExportContracts.gs`、`src/156_KnowledgeExportService.gs` source materialization、`src/181_FeatureFreezeSync.gs` six-format source metadata
- PR #48の`03-record-add-meeting.html`、`05-past-records-meeting.html`、`search-demo.js`、changed paths、PR #46〜#48 metadata/report。

補助参照: Project Source `OpenAI_Codex_Official_Practices_Reference_2026-09-05.pdf`のGoal/Context/Boundaries/Output/Verification整理、公式Best practices、GPT-5.6 Sol公式model page（high対応を確認）。視覚面は既存承認方針優先で、frontend-app-builderの新規concept生成ルールを理由に再発案しない。

WORK_ID: 0028
DISPATCH_ID: 0028-CODEX-11
BALL: CODEX
STATUS: READY
