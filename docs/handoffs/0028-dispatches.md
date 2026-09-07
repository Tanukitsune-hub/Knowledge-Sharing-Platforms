# Work 0028 dispatch control

WORK_ID: 0028
DISPATCH_ID: 0028-CODEX-11
ACTIVE_DISPATCH_ID: 0028-CODEX-11
BALL: CHATGPT
STATUS: RETURNED
MODE: INVESTIGATION
PHASE: A1.15 / INTEGRITY-RECONCILED LIGHT CORRECTION / DESIGN ONLY

## 現在の正本

ユーザーの全体整合性再確認依頼を受け、main、既存コード、PR #46/#47/#48を照合した。CODEX-10名義の返却を発見したため、未使用番号をCODEX-11へ進める。CODEX-09/10は再利用しない。

- 確認時main: `f2d965c39ed2a1259d07aaff7aca8d60e6b68a8e`
- 直前のcontroller technical review済み基準: PR #46、`400f2f0e77acf81deb32e363d79a3962dfd2f017`
- CODEX-10検索修正返却: PR #47、`d2efeff4d04d4c13dba6d0d72a707eacb9aabbe4`
- 最新返却/修復用donor: PR #48、`108a6e9002270ed0d4264991dd8971cff7cc663f`
- PR #48は最新候補だが、不要な記録種別/データ受領分岐や既存操作の不足があり、最終Light acceptはしない。
- prepared branch: `codex/0028-codex11-integrity-light-design`

実行instruction:
`docs/handoffs/0028-CODEX-11-meeting-centric-design-instruction.md`

レビュー/契約根拠:
`docs/handoffs/0028-CODEX-11-consistency-review.md`

詳細の確定済みUI判断:
- `docs/handoffs/0028-CODEX-10-record-centric-architecture-decisions.md`（CODEX-11用に整合更新）
- `docs/handoffs/0028-CODEX-10-knowledge-search-action-corrections.md`（同上）

## Strategy Reset

ModeはINVESTIGATIONを維持する。作業を「CODEX-10未実行の追加修正」から「CODEX-10返却を再利用した整合性修復」へ変更する。旧PRの管理文書を正本へ取り込まず、最新mainの限定docs更新から再開する。

Primary Outcomeは単純なLightの記録/資料導線を成立させること。既存の見た目を再設計しない。本番実装やmigrationは開始しない。

## 保持するAccepted Evidence

CODEX-09 / PR #46の15画面render、1366×768 overflow 0、sidebar 7/active 1、console warning/error 0、Product Design QA P0/P1/P2=0、local456 tests PASS、src/dist/runtime変更NONEは当該artifactの過去証拠として保持する。

CODEX-10 / PR #47/#48も検証PASSを報告しているが、今回はGitHub source/文書レビューであり、ChatGPTがそれらを再実行したとは扱わない。不要分岐等が残るため「最新要件との全体整合PASS」には読み替えない。static designでApps Script実機の保存・認証・検索・引用を認定しない。

## CODEX-11の確定範囲

- 単一の記録登録form/過去記録一覧。資料tab、記録種別selector、受領専用form、資料だけ追加routeなし。
- 親記録の保存成功後だけ資料登録。既存親へは後日追加可能。親・file・関係確定の部分失敗と同一ID再試行を区別するdemo。
- GP以外も資料を添付。GP依存のvalidation/filename/search/citationはfuture deltaを対応表へ記録。
- 資料行の`削除`は当該リンク解除。記録のInactiveや資料全体のInactive、物理削除と分離する。
- 記録本文、原本、属性、関連GP、編集、記録削除/復元、既存資料関連付け/分類編集の残置・移設を検証する。
- 検索の面談先はgeneric entityKey。全文出力は独立buttonかつ空質問/AI未設定でも使える非AI動作設計。既存上限や原本整合は維持。
- 7 sidebar、Light-only、metallic gold、紗綾形、面談集計の9列、admin preset、Work 0027/0029の認定境界を維持。

「データ受領タブ不要」から「受領のみの記録自体を全面禁止」とした前回答の拡張解釈は確定扱いから外す。今回受領分岐を作るという意味ではない。受領のみ記録と面談実績の扱いはBUILD前確認事項。CODEX-11は通常単一formのまま進める。

## 変更権限と残余事項

許可: design/docs/local synthetic demo、検証、commit/push、新規Draft PR。production src/dist、production tests/依存更新、Drive/Sheets実データ、provider API、deploy、schema/migrationは不許可。

現在の最新Light案accept前BLOCKERは不要分岐と既存操作欠落等であり、CODEX-11の修正対象。設計修正の開始にはBLOCKERなし。親binding、non-GP source、unlink eligibility、export validator、legacy保持、受領のみ記録/集計等は後続BUILDの必須確認に分離する。

## Dispatch履歴

| Dispatch ID | Disposition |
|---|---|
| 0028-CODEX-01 | Historical tombstone; never reuse. |
| 0028-CODEX-02 | Historical tombstone; never reuse. |
| 0028-CODEX-03 | A/B/C Light探索、PR #40、RETURNED PARTIAL。 |
| 0028-CODEX-04 | selected Light family、PR #41、RETURNED。 |
| 0028-CODEX-05 | Light refinement、PR #42、RETURNED。 |
| 0028-CODEX-06 | Navigation/Workspace統合、PR #43、RETURNED。 |
| 0028-CODEX-07 | Final Light、PR #44、RETURNED。 |
| 0028-CODEX-08 | Light-only polish、PR #45、RETURNED、controller technical review PASS。 |
| 0028-CODEX-09 | User corrections、PR #46、RETURNED、controller technical review PASS。 |
| 0028-CODEX-10 | PR #47/#48に同名義のRETURNEDを確認。使用済み。改番/再利用しない。最新案は修正要。 |
| 0028-CODEX-11 | 全体整合性修復と単一記録Light、RETURNED。report: `0028-CODEX-11-meeting-centric-design-report.md`。 |

## Next gate

CODEX-11は操作demo、screenshots、validation、契約対応表、reportを返却済み。design artifact `39aaba1a5e8ae13b4015468b2d3255a9d4992f28`、12画面/22case/456 tests PASS（local）。新規Draft PRのURLはreport参照。ChatGPTがreviewし、ユーザーがLightをacceptする。Light acceptのみで本番実装・deployへ進まない。

```text
THEME_SCOPE: LIGHT_ONLY
LATEST_RETURNED_PR: 50
REPAIR_DONOR_SHA: 108a6e9002270ed0d4264991dd8971cff7cc663f
LAST_CONTROLLER_REVIEWED_BASELINE_PR: 46
USER_LIGHT_ACCEPTANCE: PENDING
CODEX_10: RETURNED / CONSUMED
ACTIVE_DISPATCH: 0028-CODEX-11
NEXT_UNUSED_DISPATCH: 0028-CODEX-12
ADD_RECORD_SUBTABS: NONE
PAST_RECORD_SUBTABS: NONE
RECORD_TYPE_SELECTOR: NONE
DATA_RECEIPT_DEDICATED_UI: NONE
RECEIPT_ONLY_BUSINESS_POLICY: CONFIRM_BEFORE_BUILD
FULL_EXPORT_UI: DEDICATED_BUTTON
PITCHBOOK_PARENT_REQUIREMENT: VALID_SAVED_MEETING_ID / FUTURE_BUILD
RELATED_FILE_DELETE_UI: UNLINK
PRODUCTION_IMPLEMENTATION_AUTHORIZED: NO
SOURCE_CODE_CHANGED: NO
RUNTIME_CHANGED: NO
READY_FOR_PRODUCTION_BUILD: NO
WORK_0028_COMPLETE: NO
```

WORK_ID: 0028
DISPATCH_ID: 0028-CODEX-11
BALL: CHATGPT
STATUS: RETURNED
