# CODEX-23 — 実測に基づく日時修復と残りR1-R8の自律完了

WORK_ID: 0028
DISPATCH_ID: 0028-CODEX-23
BALL: CODEX
STATUS: READY
MODE: BUILD

## Goal / Work Contract

既存isolated container-bound targetで日時readback不整合を解消し、PR #51のaccepted Light UI + production contractについて残りのprovider-independent R1-R8を完了する。日時修正だけで返さず、ユーザー実機確認へ渡せる状態まで進める。実装手法と実行順序はCodexが判断する。

- Route C: ChatGPTは受入・境界・最終review/mergeを所有し、Codexはローカル実装・診断・実機検証を所有する。
- ModeはBUILD。qualificationは成果の証明であり、通常の修正可能な失敗で即返却するModeではない。
- 最安の次の決定的行動: 現在のsynthetic 2件について保存値→read adapter→canonical/mapping→browser表示の最初の不一致を実測する。
- 既存targetを利用し、新しいstaging/targetを作らない。
- Completion LatchはChatGPT最終review後。Work 0030はDEFERRED_BY_USERで開始しない。

## Context / 正本

```text
repository: Tanukitsune-hub/Knowledge-Sharing-Platforms
branch: codex/0028-production-contract-build
PR: #51 / Draft
CODEX22_RETURN_HEAD: 7c18e6dc5184209882c807db08365bd12007f0bc
CURRENT_SERVED_VERSION: 3 / KNOWN_DEFECT / NOT_QUALIFIED
FAILED_REPAIR_COMMIT: 6b1f180b68f70527fad42a37b774f198531c473c
GENERATED_ARTIFACT_COMMIT: 6363c6c27aeee55bcee701732b16cc507b44fdb5
```

最新origin/mainの本instruction、`docs/handoffs/0028-dispatches.md`、`docs/handoffs/0028-CODEX-22-controller-review.md`を読む。返却HEADのCODEX-22 report、root/nearest AGENTS、work-control、既存temporal contractと該当testを参照する。全過去handoffの再読は不要。

本instructionはCODEX-22以前の実行順・1回限りの局所修正制限・再発回数の数え方を将来に向けて置き換える。恒久的な安全性・権限・データ整合条件は維持する。controller-reviewとautonomy strategyは補助根拠であり、本instructionと矛盾する旧STOP規則を適用しない。

作業開始時にlocal/remote HEAD・未commit/未push作業・target・現在versionを確認し、既存状態を採用する。report不在を外部未実行の証明にしない。並行実行が見つかれば統合前に停止する。

## Accepted evidence / 現在のfixture

- installer/I2/duplicate0、schema7/Backend exactly5は受入済み。
- CODEX-21のversioned通常UI confirmation READY/NONEと独立attestation MATCHは受入済み。editor-context STALEをproduction gateに戻さない。
- CODEX-22のR1/R2/R3 initial attachmentはversion2でPASS。GP/non-GP親各1件、non-GP master、tiny TXT1件とrelationは既存fixtureとして再利用する。
- 初回relation追加の前後でDocs body/tab content・Date/Time・business fields不変。
- version3の523/523・bundle30/30はlogic証拠のみ。日時readbackは実機FAILであり修正成功とはしない。
- provider0、AI disabled、historical75 scope外、Work0030 deferred。

synthetic再現値:

| 記録 | 入力 / formatted cells | version2 UI | version3 UI |
|---|---|---|---|
| GP | 2026-09-17 10:30 | 2026-09-17 19:30 | 2026-09-16 02:30 |
| non-GP | 2026-09-17 11:15 | 2026-09-17 20:15 | 2026-09-16 03:15 |

version2の部分PASSは保持するが、version3/final versionの未実行項目へ読み替えない。version2にも日時不具合があり、単なるrollbackで受入完了とはならない。

## 診断と修復の判断自由度

Active Hypothesisは1つ: 現在の保存値から表示値までの変換経路のどこかで、Business Date/Timeが誤った型またはtimezoneで再解釈されている。どの段階・何が原因かはまだ確定していない。

新しい修正を同期する前に、同じfixtureの実際の値・型・変換前後を最小限観測し、失敗した修正で説明できなかった差を示す。Apps ScriptのDate/formatterをNode上で仮定した値や代替formatterだけで証明しない。必要な観測点・修正方法・テスト構成はCodex自身が選ぶ。

確認に役立つ境界は、元のuser-entered/effective/formatted値・number format、実Apps Script readbackの型/Date値、script/workbook/browser timezone、adapter出力、server mapping/RPC、UI表示。全てを機械的に収集する必要はなく、最初の不一致が判定できるところまでに限定する。synthetic値だけを使用し、runtime ID/account/private URLを出力しない。

失敗した `6b1f180...` の変更は、証拠に基づき置換または通常commitで取り消してよい。推測の時間加減算、期待値の緩和、全列の無条件string化、元セル/Docs/timezoneの書換えによる辻褄合わせは禁止。Business Date/TimeとInstantの既存意味を維持し、変更が影響するsearch/detail/Full Output等の共通read pathを確認する。

最小の認可済みread-only診断・安全な観測追加は許可する。ただし汎用eval/debug runner、隠しRPC、tool policy bypassを作らない。read-only browser評価でwrite RPCを呼ばない。診断用の一時要素はfinal candidateへ残す必要性を評価し、不要なら同じ変更範囲で除去する。

## Autonomous authority / 予算

同一PR / 同一target / 同一single owner-only deploymentで、原因調査、最小修正、focused regression、bundle再生成、source sync、immutable version作成、既存deploymentのversion更新、実機再検証、残matrixへの続行を自己判断してよい。小さな通常UI/導入操作上の修復も必須Outcomeに直接必要なら範囲内。

- 追加repair→target-runtime検証は最大3cycles。初回の観測・再現、read-only調査、native操作待ちはrepair失敗回数にしない。
- 修正後に再発したら影響matrixを止め、同run内でStrategy Resetする。受入済み証拠と副作用を保持し、新しい判断に直結する観測を得てから次cycleへ進む。
- 同一問題への修正後実機検証が2cycles連続で不合格、または3cyclesを使い切って必須項目が残れば返却する。単に同じ症状を2回見ただけでは返さない。同じ仮説・同じ操作の盲目的再試行は禁止。
- source syncは合計最大4回（必要な診断専用同期1回を含む）、新immutable version最大3件、同じdeploymentのversion更新最大3回。新target/second deploymentは0。
- confirmation再実行はsecurity関連変更や正当な再確認が必要なcandidateだけ、各candidate最大1回・計最大3回。成功済み確認を不要に繰り返さない。
- local focused validationを優先し、source変更時と最終候補に必要なcanonical/bundle validationを実施する。変更なしの全test反復はしない。

CODEX-22の失敗履歴は保持する。本Dispatchはその反省に基づく新しい有限予算であり、過去の未達をPASSに変更しない。

## Acceptance Evidence / Done when

1. 同じ既存2件の日時がactual versioned Web Appの検索・詳細等の影響面で元の入力/authoritative値に一致する。原因と修正前後が実測で結び付く。元セル・business fields・Docsは保持。
2. R1: schema7 / Backend exactly5 / resources・AI disabled。既存証拠の再利用は変更非影響の根拠付き。
3. R2/R3: 既存GP/non-GP親と初回添付の関係・stable ID・metadataをfinal候補で必要十分に確認。親/初回添付をやり直さない。
4. R4: 既存Meetingへfollow-up tiny synthetic fileを追加。親ID不変。
5. R5: visible deleteはunlinkのみ。実ファイルを保持しrelinkで同じDocument_ID。
6. R6: relation-only add/unlink/relink前後でauthoritative Docs body/tab contentのexact equality、Date/Time・無関係business fields不変。
7. R7: dedicated Meeting-only non-AI Full Outputをactual UIで確認。AI/question/provider不要。既存契約のbounded invalid/no-result挙動を維持。
8. R8: same single deployment / USER_DEPLOYING / MYSELF、provider0、AI disabled、予期しないtrigger0、機密データ0、物理削除0。
9. final source・生成物・served versionの対応、必要logic tests、runtime evidence、残余事項が記録され、BLOCKERなし。

証拠順位: 許可されたユーザー実機操作とauthoritative persisted state / 実browser結果 > production-source回帰test > mock/推論。失敗を実行環境・tooling・application・data integrityに分ける。

各R項目に実行version/refと、今回直接観測か変更非影響の既存証拠の継承かを記録する。共通read adapter変更で影響する項目は再検証し、NOT_RUNをPASSにしない。必須条件を新しく増やさず、装飾・大容量試験・網羅timezone対応等はFOLLOW_UP/OPTIONALへ。

## 固定境界 / 途中返却

元の2件のDate/Time・Docs・baselineを変更しない。新target、second parallel deployment、historical75操作、物理削除、破壊的migration、実/機密データ、公開範囲拡大、課金、Direct OpenAI/Gemini/Azure呼出し、AI sync有効化、Work0030着手は禁止。秘密・private URL/ID/account/hash値はGitHub/chatへ保存しない。

途中返却は、予算/繰返し限界、データ破損・証拠汚染・target identityの不確実性、権限/費用/公開範囲/accepted architectureの変更が必要、安全な許可済み実行経路が存在しない場合のみ。tooling制限に遭遇しても、許可済み通常UI/正規APIで安全に進められる範囲は先に終える。

ユーザーのnative操作が本当に必要なら同Dispatchで `BALL: USER / STATUS: ACTION_REQUIRED`。file chooser等では該当tabと未送信状態を保持し、既に確認済みのpermission設定変更を根拠なく再依頼しない。OAuth/token/秘密のchat貼付けは求めない。

mainのmerge/rebase/resetやforce pushを行わない。control docsはorigin/mainから別読取し、実装branchの古いcontrol docsでmainを上書きしない。PR #51はDraft維持・mergeなしで返す。

## Report / Completion Latch

`docs/handoffs/0028-CODEX-23-temporal-recovery-autonomous-completion-report.md` に、原因の確定/未確定範囲、却下した仮説、実測と修正diff、cycle数、final version/source対応、R1-R8、side effects、BLOCKER/FOLLOW_UPを日本語で記録する。途中進捗は同じreportへ集約し、handoffを増殖させない。

成功時は `READY_FOR_CHATGPT_FINAL_REVIEW: YES`。ユーザー実機確認に使う導線と短い確認項目も準備する。private access情報はローカルの既存管理経路に保持する。

ChatGPTが最終diff/report/tests/runtimeを確認してPR収束・merge・Completion Latchを行う。その後は開発を止め、ユーザー実機確認へ進む。Azure移行へ自動移行しない。

推奨モデル: GPT-5.6 Sol / High。未解決の実runtime境界診断があるためLunaへの固定移行はしない。Max/Ultraを必須にしない。

## 補助参照（仕様確認に限る）

Project SourcesのCodex運用参照資料で採用したGoal / Context / Boundaries / Done whenを維持する。最新公式情報と実測が保存資料に優先する。

- https://developers.google.com/apps-script/reference/spreadsheet/range — getValues/getDisplayValuesと値の型。表示文字列はlocale/format依存であり、それだけを汎用canonical値と決めつけない。
- https://developers.google.com/apps-script/reference/base/session — scriptとSpreadsheetのtimezoneは別。
- https://developers.openai.com/codex/learn/best-practices — outcome・制約・完了条件とリスクに応じた検証。
- https://developers.openai.com/codex/models — 利用モデル/reasoningの確認。

最終応答の冒頭と末尾:

```text
WORK_ID: 0028
DISPATCH_ID: 0028-CODEX-23
BALL: CHATGPT
STATUS: RETURNED
```

WORK_ID: 0028
DISPATCH_ID: 0028-CODEX-23
BALL: CODEX
STATUS: READY
