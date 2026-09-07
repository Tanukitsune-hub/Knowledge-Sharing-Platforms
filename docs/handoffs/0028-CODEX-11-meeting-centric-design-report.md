WORK_ID: 0028
DISPATCH_ID: 0028-CODEX-11
BALL: CHATGPT
STATUS: RETURNED

# CODEX-11 単一記録Light・全体整合性修正の返却

MODE: INVESTIGATION / DESIGN ONLY
ACTIVE_DISPATCH_ID: 0028-CODEX-11
BASE_MAIN_SHA: 40d1f2759cd3d4c9e01a1fb04607293c420cb85c
DONOR_SHA: 108a6e9002270ed0d4264991dd8971cff7cc663f
VISUAL_BASELINE_SHA: 400f2f0e77acf81deb32e363d79a3962dfd2f017
FINAL_COMMIT: 39aaba1a5e8ae13b4015468b2d3255a9d4992f28
BRANCH: codex/0028-codex11-integrity-light-design
PR_URL: PENDING_CREATION

`FINAL_COMMIT`は検証済みdesign artifactを確定したcommit。以後のreport/dispatch/PR URLのみのmetadata commitはこのartifactを変えません。PRのheadはGitHubで確認できます。

## 結果

PR #48からLight/assets/検索/preset等の使えるdesign treeを選択継承し、PR #46と同viewport比較しながら不要分岐と既存操作の不足を修正しました。補助的に直前のdesign-only試作`bf52bc7642503aa4f0baba445a0269818efd9286`（PR #49）の単一記録部分も再利用しましたが、管理文書はdonorから移植せず最新mainのCODEX-11を正としています。PR #46〜#49のclose/merge/rebase/force pushはしていません。

- 単一の通常登録form。全6 Counterparty、関連GP、面談3属性、本文/参加者/Team/Fund/フォローを保持。任意資料と既存Documentの関連付けを同じformに統合。
- 親失敗→file0、親成功→file保存→link確定を結果に表示。file失敗とlink失敗を区別し、成功分と同じIDを保持してretry。
- 過去の単一一覧→本文/属性/原本/編集/記録削除復元/資料追加。資料削除はunlinkで、他link・原本・元からInactiveの資料を保持。分類編集を補助領域へ移設。
- 単一entityの検索、compareのscope排他、固定質問/自由draft保護。独立全文出力は空質問/AIなしでも共通Meeting filterだけを適用し、scope/件数/全文/業務属性を表示。
- 7 sidebar・Light・gold・紗綾形・9列面談実績・別GP/Entity read契約を維持。受領専用分岐も受領自体の禁止も追加なし。

## 返却物

- [操作手順・review package](../design/0028/selected-light-family/integrity-light-review/README.md)
- [デモ](../design/0028/selected-light-family/01-search.html) / [全画面・screenshots](../design/0028/selected-light-family/integrity-light-review/index.html)
- [PR46/48比較](../design/0028/selected-light-family/integrity-light-review/comparison.html)
- [validation](../design/0028/selected-light-family/integrity-light-review/validation.md) / [22 case実行結果](../design/0028/selected-light-family/integrity-light-review/browser-results.json)
- [Product Design QA](../design/0028/selected-light-family/integrity-light-review/design-qa.md)
- [契約対応表](../design/0028/selected-light-family/integrity-light-review/contract-impact-map.md) / [197 control inventory](../design/0028/selected-light-family/integrity-light-review/control-coverage.md)

## Validationと限定事項

| 層 | 結果 |
|---|---|
| LOGIC_VALIDATION | PASS：`npm run check` 456/456、`validate-integrity.py`、record/search/admin demo JS syntax |
| LOCAL_BROWSER_VALIDATION | PASS：12画面1366×768、22 interaction case、page/table overflow0、nav7/active1、console warning/error0 |
| Product Design QA | final result: passed（design-only。ユーザーacceptとは別） |
| Diff hygiene | `git diff --check` / staged check PASS。変更はdesign＋このreport＋Work管理文書だけ |
| TARGET_RUNTIME_QUALIFICATION | NOT RUN：Apps Script、Workspace、provider、実保存、認証、原本readback、Docs/PDF |
| GitHub CI | PENDING_PR_SNAPSHOT。local 456 PASSをCI PASSとは扱わない |

IABで先に操作確認しましたが、DOM=1366×768に対し画像=1275×760となる撮影cropがありました。既存Playwright/Headless Chromeへ限定fallbackし、全current/baseline画像を1366×768で新規撮影、22caseを再検証しました。追加依存なし。visual/interaction修正は最大2round内、撮影fallbackで製品designを再変更していません。

本demoのstateはreload/画面遷移で初期化。過去一覧filterは入力とfixture表示の設計例で、server照合なし。summary/analytics/master/providerは表示配置と既存契約の参照であり、実操作認定はしません。実ファイルupload/内容read、実原本、実iPhone/Mobile/Safari、clipboard/Docs/PDF生成はNOT RUNです。

## 副作用・gate

SOURCE_CODE_CHANGED: NO
DIST_CHANGED: NO
PRODUCTION_TEST_DEPENDENCY_CHANGED: NO
RUNTIME_CHANGED: NO
DEPLOY_CHANGED: NO
REAL_DATA_CHANGED: NO
MIGRATION_CHANGED: NO
DARK_SYSTEM_CHANGED: NO
SIDE_EFFECT_STATE: DESIGN_DOCS_AND_DRAFT_PR_ONLY
DESIGN_BLOCKER: NONE
BLOCKER: NONE（本dispatchのdesign-only返却）
USER_LIGHT_ACCEPTANCE: PENDING
READY_FOR_PRODUCTION_BUILD: NO
WORK_0028_COMPLETE: NO

FOLLOW_UP: ChatGPT review→ユーザーLight accept。parent binding/競合、non-GP metadata/filename/引用、link eligibility/復元、関係だけの変更時のDocs原文保全、独立export validator/安全上限、legacy orphan保持、受領のみ記録と面談集計をBUILD前に固定する必要があります。小さなschema/facade変更が必要になり得ますが今回は実装していません。production BUILD/merge/deployは別承認です。

## Shared Knowledge

KNOWLEDGE_RETRIEVAL: PAT-0003, OBS-0012
KNOWLEDGE_APPLIED: PAT-0003
NEW_KNOWLEDGE_CANDIDATE: NONE

canonical `agent-knowledge-base`のorigin/mainから限定取得。最新mainとdonorを分離し、管理文書を上書きせずdesignだけを選択継承する判断に使用しました。過去thread/保存履歴は補助情報で、最新GitHub/repositoryを優先しています。thread復旧操作は実施していません。

WORK_ID: 0028
DISPATCH_ID: 0028-CODEX-11
BALL: CHATGPT
STATUS: RETURNED
