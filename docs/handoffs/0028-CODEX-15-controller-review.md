# CODEX-15 — Controller review / Strategy Reset

WORK_ID: 0028
DISPATCH_ID: 0028-CODEX-15
BALL: CHATGPT
STATUS: REVIEW
MODE: BUILD

## 結論

CODEX-15の停止はapplication defectではない。

Apps Script公式およびrepository policy上、末尾`_`のfunctionはprivateとして扱われる。既存standalone projectでは`getInstallationStatus_()` / `validateInstallation_()` / `setupKnowledgePlatform_()`の定義自体は存在するが、観測したApps Script editorの実行selectorにprivate functionが表示されず、実在する承認済みUI手順を確認できなかった。

CODEX-13 -> 14 -> 15で、同じPrimary Outcomeに対してhistorical standalone targetのexecution surfaceを3回変更している。

- Execution API -> 403 authorization boundary
- container-bound installer -> standalone targetと前提不一致
- private editor function -> observed editor UIから実行不可

これ以上historical standalone targetの実行surfaceを増やすことはOutcomeに対する純便益が低く、context drift / retry増加条件に該当する。

したがってStrategy Resetを行う。

```text
OLD STRATEGY:
  historical standalone Apps Script projectをschema 7へmigrateしてR1-R8を認定

NEW STRATEGY:
  final company install architectureと同じfresh container-bound Spreadsheet targetを
  isolated synthetic qualification environmentとして1件作成し、
  accepted generated bundle -> installer -> WEB_APP -> R1-R8をend-to-end認定
```

CONTROLLER_CLASSIFICATION: AUTOMATION / TARGET-ARCHITECTURE MISMATCH
APPLICATION_DEFECT: NO
SOURCE_REPAIR_REQUIRED: NO
STRATEGY_RESET: YES
PR_51_SOURCE_DIRECTION: ACCEPTED_FOR_QUALIFICATION
MERGE_READY: NO / runtime evidence pending

## Accepted Evidenceを保持

再オープンしない。

- frozen production source: `5842a07255a10415d39d524fd8ec174450248855`
- generated bundle: `2ab8b262c7211af5464f3201a77c6e45484cdc6c`
- focused: 78/78 PASS
- canonical: 515/515 PASS
- bundle: 27/27 PASS
- prepare lifecycle: 160 batches continuity / recent exact replay / retired rejection / unresolved INTENT preservation / bounded properties
- CODEX-14 historical standalone saved source parity: 83/83 PASS
- current historical deployment remains version 75 and unchanged
- provider calls: 0

## なぜfresh container-bound targetか

`docs/decisions/modular-source-single-bundle-distribution.md`はnormal company installを以下として確定している。

```text
new Google Spreadsheet
-> container-bound Apps Script
-> generated KnowledgeShare.bundle.gs
-> installKnowledgeShare()
-> manual WEB_APP deployment
-> readiness/security confirmation
-> Web App
```

今回必要なのは「historical standalone DEV projectを何とかmigrateすること」ではなく、accepted product/backendが実際のtarget architectureで動く証拠である。

fresh isolated targetなら以下を一度に直接証明できる。

- generated bundleの実Apps Script互換性
- container-bound installer
- schema 7 fresh setup
- 5-sheet backend/resource creation
- WEB_APP deployment
- accepted Light UI
- parent-first / non-GP / relation-only / Full Output primary flow

既存standalone projectへの追加mutationも不要になる。

## Safety / authorization

Work 0028で既にsynthetic/anonymized isolated target-runtime qualificationは許可済み。

Fresh targetはqualification専用とし、real data / company rolloutには使用しない。

許可するside effects:

- isolated qualification folder 1件
- host Spreadsheet 1件
- container-bound Apps Script project 1件
- installerがそのisolated parent配下に作るaccepted resources
- qualification WEB_APP deployment 1件
- synthetic Meetings / files / export artifacts only

禁止:

- existing historical version75 deploymentのupdate/rollback
- real confidential data
- provider API calls
- access expansion beyond qualification owner context
- physical delete/destructive cleanup
- second qualification target in same dispatch
- source repair unless fresh target reproduces direct application defect

## Historical standalone target disposition

CODEX-14でsaved sourceはnew frozen sourceへpush済みだがversion75 deploymentはold immutable sourceのまま。

この状態は本WorkのBLOCKERとしない。deploymentはold version75のままなのでnormal served behaviorは変わっていない。

CODEX-16ではhistorical standalone projectをread/writeしない。rollback pushもしない。

## Next decisive action

Fresh Dispatch `0028-CODEX-16`。

1. isolated fresh Spreadsheet + bound Apps Scriptを作成。
2. exact generated bundle / manifestをinstall targetへ1回だけ導入。
3. `installKnowledgeShare()` -> `READY_FOR_DEPLOYMENT`。
4. qualification-only WEB_APPを1件作成。
5. deployment security confirmation/readiness -> `READY`。
6. `/exec`でprovider-independent R1-R8。
7. source/bundle/deployed identity、Workspace readback、side effectsをreport。

Actual Azure OpenAI runtimeはWork 0030へDEFERしたまま。

WORK_ID: 0028
DISPATCH_ID: 0028-CODEX-15
BALL: CHATGPT
STATUS: REVIEW
