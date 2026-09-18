# CODEX-17 — 中断状態回収 / 初回installer受入条件未達

WORK_ID: 0028
DISPATCH_ID: 0028-CODEX-17
BALL: CHATGPT
STATUS: RETURNED
MODE: BUILD

確認日時: 2026-09-17 JST。

## 結果

CODEX-16は `NOT_STARTED_CONFIRMED` と分類した。read-only回収を完了した後、CODEX-17で唯一のfresh synthetic folder / host Spreadsheet / container-bound Apps Scriptを作成し、accepted bundleとmanifestを1回だけ導入した。remote source readbackは完全一致。

OAuth待ちcheckpointを `ed27db52fe1f98bb8c47bcaabeb24c51b1f14578` で保存した後、ユーザーがGoogle承認を完了した。同じDispatch・同じtargetでread-only回収したところ、実行履歴0件、hostは初期sheetのみ、folder直下はhostのみだった。承認前のeditor要求はinstaller本体を実行していなかった。

その後、初回installer本体を1回実行した。Apps Script履歴では `installKnowledgeShare` / Editor / 2026-09-17 08:02:59 JST / 2.459秒 / 完了。しかしinstallation status sheet、Backend、Audit、knowledge folders、Exportsは作成されず、Script Propertiesも空だった。`READY_FOR_DEPLOYMENT` は未達。最初のnon-consent runtime acceptance failureとしてSTOPした。I2・deployment・R1-R8・patchは行っていない。

実行の「完了」は業務処理の成功を意味しない。戻り値/error codeは直接取得できておらず、具体的なroot causeは未確定。次の判断はChatGPTへ返す。target/sourceを再作成・再導入しない。

```text
CODEX16_RECOVERY_STATE: NOT_STARTED_CONFIRMED
REMOTE_MAIN_AT_START: a216de7fbce03e61a07ba3e71b61186b409ae49e
REMOTE_PR_HEAD_AT_START: 751df8350b9f08cb5a6650e5bd21d1e7793f8ab7
LOCAL_HEAD_AT_START: 751df8350b9f08cb5a6650e5bd21d1e7793f8ab7
LOCAL_UNPUSHED_STATE: PRIMARY_BRANCH_CLEAN / LOCAL_ONLY_COMMITS_0 / HISTORICAL_WORKTREE_PRESERVED
EXTERNAL_TARGET_STATE: CODEX16_ABSENT_CONFIRMED / CODEX17_SINGLE_BOUND_TARGET_CREATED
RESUME_POINT: STOP_AFTER_FIRST_INSTALL_ACCEPTANCE_FAILURE / CHATGPT_DIAGNOSIS_REQUIRED
INSTALLER_QUALIFICATION: BLOCKED / I1_EXECUTED_ONCE / READY_FOR_DEPLOYMENT_NOT_ESTABLISHED
BUNDLE_IDENTITY: PASS / EXACT_REMOTE_BUNDLE_AND_MANIFEST
LOGIC_VALIDATION: ACCEPTED_FROM_CODEX13 / NO_BROAD_RERUN
TARGET_RUNTIME_R1_R8: NOT_RUN / INITIAL_INSTALL_ACCEPTANCE_BLOCKER
PROVIDER_RUNTIME_QUALIFICATION: OUT_OF_SCOPE / CALLS_0
AZURE_WORK_0030: DEFERRED_BY_USER
SIDE_EFFECT_STATE: SINGLE_SYNTHETIC_TARGET / SOURCE_INSTALL_1 / QUALIFICATION_DEPLOYMENT_0 / PROVIDER_CALLS_0
SIDE_EFFECT_STATE_CODEX16_PLUS_CODEX17: CODEX16_0 / CODEX17_COUNTS_BELOW
RESIDUAL_SYNTHETIC_RESOURCES: FOLDER_1 / HOST_SPREADSHEET_1 / BOUND_SCRIPT_1
BLOCKER: INITIAL_INSTALL_COMPLETED_WITHOUT_INSTALLATION_OUTPUTS
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
| I1 初回install | OAuth後に本体実行1件・完了。status sheet/resourceなし。受入条件未達 |
| I2 冪等性 | NOT RUN。失敗修復の再試行には使わない |
| Deployment / security / readiness | NOT RUN。I1 blockerに依存 |
| R1 schema7 / 5 sheets / AI disabled | NOT RUN |
| R2 GP + non-GP Meeting | NOT RUN |
| R3 parent-bound tiny file | NOT RUN |
| R4 follow-up file | NOT RUN |
| R5 unlink / relink | NOT RUN |
| R6 Docs body exact equality | NOT RUN |
| R7 dedicated Full Output | NOT RUN |
| R8 runtime security / integrity | NOT RUN。準備段階のowner-only manifestとprovider未設定だけではPASSにしない |

accepted deterministic evidence（focused 78/78、canonical 515/515、bundle 27/27）は維持する。source変更がないため再実行していない。report更新後に `git diff --check` を実施した。初回実行後にもAPIでowner/bindingとbundle/manifest完全一致を再確認した。

### 初回実行後のread-only診断

- 実行前: Apps Script履歴は過去7日間0件。host metadataは `シート1` のみ。
- 実行後: Apps Script履歴は1件、`installKnowledgeShare`、Head、Editor、完了。editorの開始/完了ログ以外にerror codeはなく、execution detailにはCloud logなしと表示された（ログ遅延の可能性がある旨も表示）。
- Drive connectorによる実行後listingはhost 1件のみ。host metadataにも `KnowledgeShare_Installation` は存在しない。
- project settingsのScript Propertiesには保存された項目が表示されない。triggers画面は0件。
- CLI credentialでのexecution API / Sheets API readは403だったため、これらをアプリ障害の根拠にはしていない。上記はowner browserおよびDrive/Sheets connectorから直接確認した。
- sourceの `kspRunInstaller_` は初期authorize例外をcatchし、statusを永続化せず返す経路を持つ。`installKnowledgeShare` はその戻り値を返すだけでログ出力しない。この経路は観測と整合するが、直接の戻り値を取得していないため確定診断ではない。
- `getSessionIdentities` はemail取得例外を空文字へ変換し、manifestには明示的な `userinfo.email` scopeがない。これは後続診断候補に留める。実際の例外、active/effective値、scope不足による因果関係は今回証明していない。

追加のinstaller/readiness実行、debugger再実行、診断wrapper、scope変更は行わない。初回install受入条件未達という直接観測で今回の停止条件は満たされた。

## 合算予算と残存resource

| 操作 | CODEX-16 | CODEX-17 | 残り / 再開境界 |
|---|---:|---:|---|
| fresh target | 0 | 1 | 0。既存folder/host/bound projectを引き継ぐ |
| source install | 0 | 1 | 0。再pushしない |
| I1 本体実行 | 0 | 1 | 消費済み。OAuth前の実行要求・ユーザー依頼による承認画面再表示は本体実行0件と区別 |
| I2 idempotency | 0 | 0 | 未消費だがI1 failureのため実行不可 |
| immutable qualification WEB_APP作成 | 0 | 0 | 1 |
| deployment update | 0 | 0 | 0 |
| business-flow matrix | 0 | 0 | 1 bounded pass |
| historical standalone mutation | 0 | 0 | 0 |
| source repair / physical delete | 0 | 0 | 0 |
| Direct OpenAI / Gemini / Azure OpenAI calls | 0 | 0 | 0 |

停止後のfolder listingにはhost Spreadsheet 1件のみ。installer-created Backend / Audit / knowledge folders / Exports、Meeting Docs、tiny files、export artifactsは観測されない。bound project 1件はhostに紐づいて残す。全resourceを保持し、cleanupはしていない。

AI sync有効化、provider credential設定、provider resource作成、実データ書込み、共有拡大、trigger作成、Work 0030準備はすべて0。初回installerの受入条件が未達のため、runtimeのAI設定・schema readinessは未検証であり、R8のPASSとはしない。

private target mappingとmutation ledgerはignored local evidence領域に保持した。ID、private URL、account、credentialは本reportに含めない。

## OAuth履歴 / 返却先

ユーザーの承認画面再表示依頼時、editorには未承認・再試行要求の警告が表示されていたため、同一targetで承認画面を再表示した。Google未確認アプリの画面を経てユーザーから「承認完了」を受領。元タブが閉じられていたため同じprojectを開き、実行履歴0件を確認してから初回本体実行を行った。

追加のnative操作は要求しない。ChatGPTはこの初回installer結果をreviewし、原因切り分け・修正に必要な次Dispatchを判断する。既存targetと消費済み予算を引き継ぐ。CODEX-17の同run patch、第二target作成、失敗を冪等性確認として再試行することはしない。

PR #51は同じbranchのまま。report以外のtracked fileは変更しない。ChatGPT所有のdispatch register / work registryには変更を加えず、PRの収束・mergeも行わない。Work 0030は `DEFERRED_BY_USER` を維持する。

## Shared Knowledge

KNOWLEDGE_RETRIEVAL: PAT-0004, RULE-0003
KNOWLEDGE_APPLIED: PAT-0004, RULE-0003
NEW_KNOWLEDGE_CANDIDATE: NONE

PAT-0004に従い、target identity/bindingとsource parityを別々に確認した。RULE-0003に従い、fresh resourceを専用作業folder配下に配置した。

WORK_ID: 0028
DISPATCH_ID: 0028-CODEX-17
BALL: CHATGPT
STATUS: RETURNED
