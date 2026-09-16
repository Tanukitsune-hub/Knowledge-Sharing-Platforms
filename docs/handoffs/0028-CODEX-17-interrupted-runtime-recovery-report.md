# CODEX-17 — 中断状態回収 / native OAuth待ち

WORK_ID: 0028
DISPATCH_ID: 0028-CODEX-17
BALL: USER
STATUS: ACTION_REQUIRED
MODE: BUILD

確認日時: 2026-09-17 JST。

## 結果

CODEX-16は `NOT_STARTED_CONFIRMED` と分類した。read-only回収を完了した後、CODEX-17で唯一のfresh synthetic folder / host Spreadsheet / container-bound Apps Scriptを作成し、accepted bundleとmanifestを1回だけ導入した。remote source readbackは完全一致。

bound editorで `installKnowledgeShare` を選択し、初回の「実行」を1回押したところ、Googleの「承認が必要です」ダイアログが表示された。現在は「権限を確認」のnative操作待ち。installer成功、schema7、R1-R8は未認定。application defectは観測していない。

同じDispatchを維持する。OAuth後はこの既存targetの実行結果をread-onlyで確認して再開する。target/sourceを再作成・再導入しない。

```text
CODEX16_RECOVERY_STATE: NOT_STARTED_CONFIRMED
REMOTE_MAIN_AT_START: a216de7fbce03e61a07ba3e71b61186b409ae49e
REMOTE_PR_HEAD_AT_START: 751df8350b9f08cb5a6650e5bd21d1e7793f8ab7
LOCAL_HEAD_AT_START: 751df8350b9f08cb5a6650e5bd21d1e7793f8ab7
LOCAL_UNPUSHED_STATE: PRIMARY_BRANCH_CLEAN / LOCAL_ONLY_COMMITS_0 / HISTORICAL_WORKTREE_PRESERVED
EXTERNAL_TARGET_STATE: CODEX16_ABSENT_CONFIRMED / CODEX17_SINGLE_BOUND_TARGET_CREATED
RESUME_POINT: SAME_TARGET_INITIAL_INSTALL_GOOGLE_OAUTH / READ_BACK_EXECUTION_BEFORE_NEXT_CALL
INSTALLER_QUALIFICATION: ACTION_REQUIRED / INITIAL_RUN_REQUESTED / SUCCESS_NOT_OBSERVED
BUNDLE_IDENTITY: PASS / EXACT_REMOTE_BUNDLE_AND_MANIFEST
LOGIC_VALIDATION: ACCEPTED_FROM_CODEX13 / NO_BROAD_RERUN
TARGET_RUNTIME_R1_R8: NOT_RUN / INSTALLER_CONSENT_PENDING
PROVIDER_RUNTIME_QUALIFICATION: OUT_OF_SCOPE / CALLS_0
AZURE_WORK_0030: DEFERRED_BY_USER
SIDE_EFFECT_STATE: SINGLE_SYNTHETIC_TARGET / SOURCE_INSTALL_1 / QUALIFICATION_DEPLOYMENT_0 / PROVIDER_CALLS_0
SIDE_EFFECT_STATE_CODEX16_PLUS_CODEX17: CODEX16_0 / CODEX17_COUNTS_BELOW
RESIDUAL_SYNTHETIC_RESOURCES: FOLDER_1 / HOST_SPREADSHEET_1 / BOUND_SCRIPT_1
BLOCKER: NATIVE_GOOGLE_OAUTH_REQUIRED
READY: NO
```

## Phase 0 — read-only回収の根拠

- `origin/main`およびPR branchを通常fetchし、GitHub PR #51のhead / branch / Draft / OPEN状態を直接確認した。branchは `codex/0028-production-contract-build`。mainのmerge/rebase/resetは行っていない。
- 指定された6文書を最新 `origin/main` から読み、CODEX-17をactive contractとした。加えてwork-control、distribution、deployment guardrails、CODEX-15 controller reviewを参照した。
- primary worktreeにはuntrackedを含む未commit変更、local-only commit、CODEX-16 reportがなかった。remote PR branchにもCODEX-16 reportおよびCODEX-15後のcommitはなかった。
- ignored evidence領域にCODEX-16/17の先行artifactはなかった。旧CODEX-13検証用detached worktreeには未commitのdist生成物が残っていたが、更新時刻は2026-09-08、内容はaccepted bundle commit `2ab8b262...` と一致した。CODEX-16由来の新規source変更ではない。既存状態を保持した。
- 現在のprimary `src/` はfrozen source `5842a07255a10415d39d524fd8ec174450248855`、`dist/` はbundle commit `2ab8b262c7211af5464f3201a77c6e45484cdc6c` と差分なし。
- Drive connectorで `0028`、qualification folder、CODEX-16発行以降のSpreadsheet/script、専用作業folderの直下をmetadataのみ検索した。CODEX-16候補はなかった。無関係な文書本文は読んでいない。
- さらに既存CLI認証のprincipalと以前のownerが一致することをprivateに照合した。同じownerのDrive APIで、2026-09-08 00:00 UTC以降に作成されたfolder / Spreadsheet / scriptを、trashedも除外せず全件取得した。1ページ・3件・次ページなし。いずれもCODEX-16 targetではなく、synthetic候補は0件だった。
- 同じownerのApps Script画面には既存8 projectが表示され、最新更新日は2026-09-08。CODEX-16のfresh bound projectはなかった。historical standalone project本体のsource / deploymentは今回read/writeしていない。
- GitHub出力の不在だけではなく、owner continuity、作成時刻で区切った完全なDrive inventory、Apps Script一覧、local evidenceの組合せで `NOT_STARTED_CONFIRMED` とした。この分類を宣言した後にのみ作成を開始した。

観測上の制限: 過去の全監査ログを取得したわけではない。禁止されていた物理削除や別ownerへの移管等の履歴全体を証明するものではない。指定されたowner・期間・synthetic targetのbounded recoveryに基づく分類である。

## Phase 1 — 完了したtarget準備

専用ChatGPT/Codex作業folder配下にsynthetic qualification folderを1件作成した。そのfolderのGoogle Drive UIから空のGoogle Spreadsheetを1件作成し、当該hostの「拡張機能 → Apps Script」からbound projectを1件作成した。

Apps Script APIとDrive APIで以下を確認した。

- project creatorと認証ownerの一致。
- project `parentId` と新規hostの一致。
- hostのparentと新規isolated folderの一致。
- host/folderはowner所有・非共有・非trashed。
- accepted Git artifactのSHA-256を照合した後、Projects content updateを1回だけ実施。
- remote contentは2ファイル構成で、bundleとmanifestの文字列がそれぞれcanonical Git artifactに完全一致。
- Advanced Drive v3はaccepted manifestから導入され、editorのサービス一覧でも確認できた。追加のservice変更は行っていない。

```text
SOURCE_COMMIT: 5842a07255a10415d39d524fd8ec174450248855
BUNDLE_COMMIT: 2ab8b262c7211af5464f3201a77c6e45484cdc6c
BUNDLE_FILE_SHA256: 4442a8c39955820c34e01290d82a0c97843b88482c8ccf7fa077d364edd5d0c0
MANIFEST_SHA256: ac17af72f807a89a162f82f3da5d7a2bcf3f14404acd59f9d0316ae9ae413dfa
```

project作成時の自動HEAD deployment metadataは存在するが、versionNumberがなく、qualification用のimmutable WEB_APP作成とは区別する。新規のversion付きqualification deploymentは0件。deployment UI操作も0回。

## Installer / R1-R8

| Gate | 状態 / 直接観測 |
|---|---|
| I1 初回install | editor実行要求1回。Google承認ダイアログで停止。成功したfunction executionは未観測 |
| I2 冪等性 | NOT RUN。I1成功後の1回のみ許可 |
| Deployment / security / readiness | NOT RUN。I1/I2完了後 |
| R1 schema7 / 5 sheets / AI disabled | NOT RUN |
| R2 GP + non-GP Meeting | NOT RUN |
| R3 parent-bound tiny file | NOT RUN |
| R4 follow-up file | NOT RUN |
| R5 unlink / relink | NOT RUN |
| R6 Docs body exact equality | NOT RUN |
| R7 dedicated Full Output | NOT RUN |
| R8 runtime security / integrity | NOT RUN。準備段階のowner-only manifestとprovider未設定だけではPASSにしない |

accepted deterministic evidence（focused 78/78、canonical 515/515、bundle 27/27）は維持する。source変更がないため再実行していない。今回のreportは `git diff --check` で検証する。

## 合算予算と残存resource

| 操作 | CODEX-16 | CODEX-17 | 残り / 再開境界 |
|---|---:|---:|---|
| fresh target | 0 | 1 | 0。既存folder/host/bound projectを引き継ぐ |
| source install | 0 | 1 | 0。再pushしない |
| I1 editor実行要求 | 0 | 1 | OAuthで保留。同一初回要求を回収し、成功済みなら再実行しない |
| I2 idempotency | 0 | 0 | I1成功後に1回 |
| immutable qualification WEB_APP作成 | 0 | 0 | 1 |
| deployment update | 0 | 0 | 0 |
| business-flow matrix | 0 | 0 | 1 bounded pass |
| historical standalone mutation | 0 | 0 | 0 |
| source repair / physical delete | 0 | 0 | 0 |
| Direct OpenAI / Gemini / Azure OpenAI calls | 0 | 0 | 0 |

停止後のfolder listingにはhost Spreadsheet 1件のみ。installer-created Backend / Audit / knowledge folders / Exports、Meeting Docs、tiny files、export artifactsはまだ観測されない。bound project 1件はhostに紐づいて残す。全resourceを保持し、cleanupはしていない。

AI sync有効化、provider credential設定、provider resource作成、実データ書込み、共有拡大、trigger作成、Work 0030準備はすべて0。初回installerが完了していないため、runtimeのAI設定・schema readinessは未検証であり、R8のPASSとはしない。

private target mappingとmutation ledgerはignored local evidence領域に保持した。ID、private URL、account、credentialは本reportに含めない。

## 必要なnative操作 / 同一Dispatchでの再開

保持したChromeの `KSP Work 0028 Synthetic Bound Qualification` editorで、「権限を確認」から同じownerのGoogle承認を完了する。ユーザーにコード変更、installer再実行、deployment作成、ID/URL/tokenの送信は求めない。

承認完了後、同じ `0028-CODEX-17` で、まずexecution log・hostのinstallation status・folder resourcesをread-only確認する。OAuthによって保留中のI1が続行していた場合はその結果を採用する。成功を確認してからI2以降へ進む。初回実行の状態が曖昧なら重ねて実行しない。fresh targetの最初のnon-consent runtime failureではSTOPし、同runでpatchしない。

PR #51は同じbranchのまま。report以外のtracked fileは変更しない。ChatGPT所有のdispatch register / work registryには変更を加えず、PRの収束・mergeも行わない。Work 0030は `DEFERRED_BY_USER` を維持する。

## Shared Knowledge

KNOWLEDGE_RETRIEVAL: PAT-0004, RULE-0003
KNOWLEDGE_APPLIED: PAT-0004, RULE-0003
NEW_KNOWLEDGE_CANDIDATE: NONE

PAT-0004に従い、target identity/bindingとsource parityを別々に確認した。RULE-0003に従い、fresh resourceを専用作業folder配下に配置した。

WORK_ID: 0028
DISPATCH_ID: 0028-CODEX-17
BALL: USER
STATUS: ACTION_REQUIRED
