# Work 0028 / CODEX-10 candidate — Knowledge Search action corrections

WORK_ID: 0028
STATUS: CLOSED USER CORRECTION FOR NEXT DISPATCH
MODE: INVESTIGATION
SCOPE: DESIGN ONLY / FUTURE BUILD REQUIREMENT RECORDED

## Context

Draft PR #46 / CODEX-09 is the current Light visual review target. After its return, the user identified two additional Knowledge Search corrections. These are not production implementation authorization.

## 1. Primary selector: `GP` → `面談先`

Knowledge Searchの主要1行目にある`GP`は、通常検索対象がGPに限らず、LP / Asset Owner、日本生命、グループ会社、Consultant / Gatekeeper、その他を含むMeeting counterparty全体であるため、ユーザー向けlabelを`面談先`へ変更する。

Row 1 final visible order:

1. `面談先`
2. `情報ソース`
3. `開始日`
4. `終了日`
5. `全期間`

`面談先`selectorはGP専用`gpId`をprimary UI truthにせず、既存Counterparty Entity / `entityKey` contractを使う。GPはその選択肢の1種として扱う。

Existing counterparty categories remain unchanged:

- GP / 運用会社
- LP / Asset Owner
- 日本生命
- グループ会社
- Consultant / Gatekeeper
- その他

`比較`modeの2–5 Entity selectorや`面談準備`のtarget requirementは既存special semanticsを維持する。

`資料のみ`を選んだ状態でnon-GPの面談先を指定した場合など、条件の組み合わせで該当資料が0件になることは許容し、架空の関係推定や自動的なGP置換は行わない。

## 2. `全文出力`をAIモデルselectorから分離

`全文出力（AIを使わない）`を`AIモデル`プルダウンの選択肢として表示しない。

AIモデルselectorには、管理者が通常利用者向けに許可したAI model/profileだけを表示する。Work 0027のGemini qualified-disabled / normal-user hidden baselineと、no provider auto-failoverを維持する。

Knowledge Searchのaction areaに独立した`全文出力`buttonを設ける。

推奨action order:

1. `検索` — primary
2. `全文出力` — dedicated secondary action
3. `条件をクリア`

`全文出力`はAI routeではなく、既存Knowledge Export系のnon-AI actionとして扱う。

## Full Output — user outcome

目的はシンプルに、選択条件に一致する過去Meetingの権威あるGoogle Docs内容と、そのMeetingに紐づく属性データをまとめて書き出すこと。

### Scope

- sourceはMeetingのみ。
- Pitchbook本文は含めない。
- Pitchbook原資料リンク一覧も別sectionとして含めない。
- `Related_Pitchbook_IDs`のようにMeeting row自体に保存されているrelationship attributeは、Meeting metadataの一部として書き出してよい。
- AI / File Search / model inferenceは一切実行しない。
- 検索画面で指定したMeetingへ適用可能なfilterをそのままexport scopeに使う。
- lifecycleは既存Knowledge ExportのActive authoritative source boundaryを維持し、削除済み資料を勝手に混ぜない。

### Per-Meeting package

各Meetingについて、少なくとも次を含む「権威あるGoogle Docs全文 + 保存済み属性」のpackageとする。実productionではsource schemaから利用可能なauthoritative fieldを省略しないことを優先する。

- Meeting ID / 日付 / 時刻
- 面談先区分 / 面談先
- 関連GP
- 面談場所
- Asset Class
- Equity / Debt
- Team
- Fund / Strategy
- Meeting Type
- Related Pitchbook IDs
- 要フォロー状態 / follow-up metadata
- 参加者等、Meeting_Index / authoritative Meeting rowに保存されているその他属性
- 権威あるGoogle Docsの全文
- authoritative document identity / URL等、既存export integrity確認に必要なmetadata

表示名へ解決できる属性はIDと表示名の双方を確認できる形が望ましい。ただし新しいdatasetや推測による属性補完はしない。

### Existing export machinery

現行productionにはMeeting Google Docs全文とmetadataをpackage化し、preview / copy / Google Docs / PDFへ出力するKnowledge Export contractがある。Future BUILDではこれを可能な限り再利用し、AI model selectorと結合しているpresentationを分離する。

専用`全文出力`buttonから既存preview/export flowへ遷移する構成を第一候補とする。ユーザーが同じ画面で対象件数や内容を確認してからcopy / Google Docs / PDFを選べる既存安全性は維持してよい。

## Preserve

- Knowledge Search通常AI検索のMeeting / Pitchbook File Search contract
- `情報ソース`: `面談記録・資料 / 面談記録のみ / 資料のみ`
- rolling 3 years / 全期間 behavior
- `検索モード / AIモデル / 質問`のCODEX-09 layout
- admin-managed preset design / server-authoritative fixed prompt future requirement
- Work 0027 Gemini hidden baseline
- Work 0029 shared-admin security behavior
- production `src/**` / `dist/**` / deployは未許可

## Acceptance evidence for next design correction

- Row 1 first label is `面談先`, not `GP`
- selector clearly represents GP / non-GP counterparty entities
- `AIモデル`selector contains no Full Output option
- independent `全文出力`button is visible in the action area
- Full Output design clearly states Meeting-only / non-AI
- export preview sample contains Meeting Google Docs body plus representative Meeting attributes
- no Pitchbook body / Pitchbook reference-link section in Full Output
- existing normal AI search source/citation/model behavior remains visually distinct
- production `src/**` / `dist/**` changes NONE

次にdesign correctionを実行する場合はfresh Dispatch ID `0028-CODEX-10`を使用し、CODEX-09は再利用しない。
