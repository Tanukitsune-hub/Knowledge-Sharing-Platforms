# Work 0028 — ナレッジ検索と独立全文出力の設計判断

WORK_ID: 0028
MODE: INVESTIGATION
SCOPE: DESIGN ONLY / FUTURE BUILD REQUIREMENTS

CODEX-10はPR #47/#48で使用済み。本版は2026-09-07の全体整合性レビューを反映する。次の実行正本は`0028-CODEX-11-meeting-centric-design-instruction.md`、詳細根拠は`0028-CODEX-11-consistency-review.md`。

## 検索条件

- Row 1: `面談先 / 情報ソース / 開始日 / 終了日 / 全期間`。
- Row 2: `検索モード / AIモデル`。
- Row 3: 横幅を広く取った`質問`欄。
- 初期期間は既存business timezoneに従った直近3年。全期間ONで日付を条件から外し、OFFで直前値を復元する。
- 面談先は既存Counterparty Entity / entityKeyを使用し、GP/LP/日本生命/グループ会社/Consultant/その他を扱う。GP専用selectorを名前だけ変更しない。
- 同じ相手先を主要欄と詳細欄で二重管理しない。比較2〜5 Entityと単一entityKeyの競合を避ける。面談準備のtarget必須を維持するが、同じ対象の再入力を強制しない。
- 情報ソースは`面談記録・資料 / 面談記録のみ / 資料のみ`。新規non-GP親に適格な添付資料があれば`資料のみ`でも対象にする。真の0件は示すが、GP限定のまま0件になる不整合を許容しない。
- その他のMeeting専用filterを資料へ無断拡張しない。未対応組合せは明示して既存契約を維持する。

## AI検索

AIモデルselectorには通常利用者に許可されたAI profileのみを表示。全文出力、Thinkingは置かない。Gemini hiddenとno automatic failoverを維持する。

自由質問は編集可能。他modeは管理者固定文をgray readonly表示し、自由質問draftを復元する。管理者presetの保存・serverによる固定文の解決はfuture BUILDであり、demoを実装済みと扱わない。

## 全文出力

action順は`検索 / 全文出力 / 条件をクリア`。全文出力は独立した非AI buttonであり、AIモデルselectorのoptionではない。

対象は共通filterに一致するActiveなMeeting。Docs原文全文と保存済み業務属性を出力する。Pitchbook本文もPitchbookリンク集も出力しない。Meeting自身のRelated_Pitchbook_IDsは業務属性として出力できる。

### AI条件との分離

- 質問、AIモデル/API設定、preset、比較用の選択件数、面談準備用targetを前提にしない。
- 共通条件に有効な日付/相手先等があれば空質問でも出力可能。
- 情報ソースselectorはAI検索用。exportは常にMeeting-onlyである旨をbutton補足とpreviewで示す。selector値を勝手に変更しない。
- previewは実際に適用する共通filter、件数、原文/属性を示す。mode専用条件をexport対象と誤認させず、scopeを黙って拡張しない。
- 無効な共通filterは拒否。古いvalidatorを通すための架空質問注入はしない。

### 出力内容

Meeting ID、日付/時刻、面談先区分/相手先、関連GP、場所、Asset Class、Equity / Debt、Team、Fund / Strategy、Meeting Type、Related Pitchbook IDs、要フォロー/メモ、参加者、確認済み等の業務属性、authoritative Docs identity/URLと全文を対応表で確認する。存在しない項目を補完しない。IDと表示名、未設定を区別する。

認証token、credential、provider内部状態JSON等の内部情報は業務属性の対象外。全rowの無条件dumpはしない。

既存Knowledge Exportのpreview/copy/Google Docs/PDF、安全上限、source readback/fingerprint、再生成防止を可能な限り再利用する。件数/文字数/時間上限を外さず、読出し失敗・上限超過・0件を明示する。途中切捨てを「全文」と表示しない。

## 検証境界

CODEX-11は静的demoと契約対応表まで。現行155/156のmode依存validatorや出力処理をproductionで変更する許可はない。実装と実機検証はLight accept後の明示BUILD承認・Strategy Resetを要する。
