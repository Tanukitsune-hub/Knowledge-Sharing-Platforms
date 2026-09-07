# CODEX-13 — prepare lifecycle修正・runtime qualification返却

WORK_ID: 0028
DISPATCH_ID: 0028-CODEX-13
BALL: CHATGPT
STATUS: RETURNED
MODE: BUILD

## 結果

prepare成功履歴による生涯32 batch制限を解消した。160 batchの連続完了、直近32 requestのexact replay、retired tokenの重複採番拒否、未確定INTENTの保全、bounded Script Propertiesをproduction adapterのfocused testsで確認した。

deterministic / bundle gateはPASS。Apps Scriptのidentity chainも既存version 75についてAPIとbrowserの両方で確定した。その後、privateな`getInstallationStatus_`をExecution APIで1回呼び出したところHTTP 403 `PERMISSION_DENIED`となった。最初のruntime failureで停止し、source push / setup / version / deployment mutationはすべて0。修正sourceのtarget-runtime primary flowは未認定のため、PR #51はDraftを維持する。

```text
LOGIC_VALIDATION: PASS
BUNDLE_VALIDATION: PASS
TARGET_RUNTIME_QUALIFICATION: BLOCKED / PRIMARY_FLOW_NOT_RUN
PROVIDER_RUNTIME_QUALIFICATION: DEFERRED_TO_WORK_0030 / CALLS_0
SIDE_EFFECT_STATE: SOURCE_PUSH_0 / SETUP_0 / VERSION_0 / DEPLOYMENT_0 / BUSINESS_WRITE_0
BLOCKER: PRIVATE_EXECUTION_API_PERMISSION_DENIED
READY: NO
```

## Work Contractと正本

- Outcome: PR #51のprepare lifecycle BLOCKER修正とprovider-independent runtime primary flowの認定。
- Scope: prepare lifecycle、関連client token wiring、回帰tests、exact-source dist、read-only identity確認、許可範囲のsynthetic qualification。
- Evidence: authoritative project/deployment metadata → browser描画と対応する実行記録 → remote source照合 → deterministic tests。ローカルPASSをtarget-runtime PASSへ昇格させない。
- Bounds: source repairはprepareのみの1 round、最終focused/canonical verificationは1 full pass、deployment mutation最大1、runtime最初のfailureで停止。
- Non-goals: provider calls、実データ、broad rollout、destructive migration、Dark/System、新sheet/relationship table、Remote Control復旧。
- 最新`origin/main`: `e43c41b386acfd940704f95102a14e02905c2ffd`。CODEX-13 instruction、CODEX-12 controller review、Azure provider decision、deployment operations、適用AGENTSを確認。
- 開始HEAD: `2916cc7946626ec95ab46c2a70ffada9fc85f497`。開始時working treeはclean。
- branch: `codex/0028-production-contract-build`、既存[Draft PR #51](https://github.com/Tanukitsune-hub/Knowledge-Sharing-Platforms/pull/51)を継続。新PR、main merge/rebaseなし。
- `docs/handoffs/0028-dispatches.md`と`docs/planning/work-registry.md`は開始HEADから変更なし。main上の管理記録をbranchから上書きしていない。

## Frozen source / bundle

| 対象 | exact ref / evidence |
|---|---|
| CODEX-13 source・tests commit | `5842a07255a10415d39d524fd8ec174450248855` |
| 同sourceからのbundle commit | `2ab8b262c7211af5464f3201a77c6e45484cdc6c` |
| runtimeで今回観測した既存source | `9fa668619a0b91fb60ed53f696363d3954cf709e`相当、immutable version 75 |
| 修正sourceのtarget-runtime exact tested ref | `NOT RUN`（pushしていない） |

deterministic gate後はapplication sourceをfreezeした。403後にsource変更、別実行経路、追加deployment、別仮説の修正は行っていない。schema 7の既存4列append設計を維持し、CODEX-13ではschemaやその他業務機能を変更していない。

## Prepare lifecycle契約

| 契約 | 実装・証拠 |
|---|---|
| 正常利用が32 batchで止まらない | 既存monotonic `NEXT_BATCH_ID`から16 admission単位のgenerationを導出。古いgenerationのCOMPLETEのみ容量に応じ退役。160 completed batch / 320 rowsを確認 |
| recent lost-response replay | 退役判定より先にretained requestをactor/payload/parent scopeと照合し、元のBatch_ID / Document_ID / slotをreadback。最後の32件でcounter advance / duplicate write 0 |
| retired request再送 | 未保持tokenはcurrent generationのみ新規受付。128 retired request、未保持legacy token、future generationをsafe rejection。clock expiryや無期限tombstoneに依存しない |
| unresolved INTENT | 自動退役の対象外。既存readback・counter・row整合性検証を維持。不明な状態は`PITCHBOOK_PREPARE_UNCERTAIN`でfail-closed |
| Script Properties bounded | REQUESTは最大32件、各intent最大8,000 UTF-8 bytes。未完了batch reservationも32件でbackpressure。完了済みderived reservationをauthoritative rowのActive/File_ID/File_URL確認後に整理。160完了試験で関連property数は最大33、測定serialized量は300,000 bytes未満 |
| 未完了uploadの安全性 | 32 unfinished batchでは`PITCHBOOK_PREPARE_UPLOAD_BACKLOG`、write 0。upload完了後は新規受付が再開。これは未完了backlog制限であり生涯利用制限ではない |
| requestId省略の迂回防止 | serviceとproduction adapterの両方でrequired guard。missing/null/empty/whitespaceはallocation / property / counter write 0 |
| client | 新規prepare前だけbootstrapからgenerationを取得。lost response時は同requestId・同payloadを保持し、generationを取り直して別採番しない |

retained legacy tokenは従来のexact readbackを維持する。既に退役したtokenの再送は自動再採番せず、保存結果の確認が必要。bootstrap取得後に他利用者のadmissionがgenerationを進めた未送信tokenも安全に拒否する。ID counterのresetは許可していない。

独立read-only reviewでrequestId省略経路を指摘され、同repair round内で閉じた。最終reviewに残るmaterial BLOCKERはなし。追加testのadapter fixture呼出し誤りによる1 failureはtest自身を訂正したうえで最終focused PASSを取得した。assertionやproduction safetyは弱めていない。

## 検証

実行順序と結果:

1. `node --test tests/pitchbook-prepare-idempotency.test.cjs tests/meeting-centric-ui.test.cjs tests/pitchbook.test.cjs tests/pitchbook-completion-cas.test.cjs tests/maintenance-adapters.test.cjs tests/ai-parent-bound.test.cjs tests/ai-provider-parent-cas.test.cjs` — **78/78 PASS**。
2. `npm run check` — **515/515 PASS**。agent foundation、60 server sources / 22 HTML、temporal contract、32 normal / 3 guarded operator / 783 private functions、bundle整合性もPASS。
3. PR branchで`npm run build:bundle` — exact source commitから生成。bundle 1,162,159 bytes / 19,021 lines。
4. `npm run check:bundle` — **27/27 PASS**。
5. `git diff --check` — PASS。
6. secret/private-ID scan — bundle validatorの禁止patternと、返却差分のcredential pattern・今回のprivate mapping/endpoint/accountの混入を確認、検出0。

`npm run check`自体がbundle freshnessを検証するため、同じsource commitのdetached一時検証worktreeでのみ事前に派生bundleを生成し、canonical checkを1回実行した。PR branchのdist再生成はcanonical通過後に実行した。両worktreeのdist 4ファイルはbyte一致。別Apps Script runtimeは作成していない。

frontend-testing-debugging skillに沿ったlocal production UI QAも実施。Chromium 151.0.7922.34、1366×900 / 390×844、nav7、non-GP parent-first RPC、past detail、質問・AI modelなしの独立全文出力、3主要pageの横overflowなしを確認。page/console errorsは0。390px screenshotも目視確認した。外部API境界はsynthetic transport fixtureであり、Apps Script認定ではない。出力先をignored local evidenceへ指定可能にし、CODEX-12の既存screenshotsは上書きしていない。

## Read-only identity chain — 既存version 75

| 要素 | 今回のpositive proof |
|---|---|
| Git / local tested source | 上記source・bundle ref、deterministic / parity PASS、source freeze |
| Apps Script project | current Projects APIのproject IDとlocal mappingが一致。API principalはproject creatorと一致 |
| remote saved source | GET contentの82/82 filesが既存accepted sourceに一致 |
| immutable version/source | version 75のGET contentも82/82一致。saved sourceと別々に確認 |
| intended deployment | 同じprojectのAPI inventoryとbrowser「デプロイを管理」の現行選択を照合。Work 0029 continuity、version、entrypoint、source、accountを併用 |
| WEB_APP / intended `/exec` | APIのWEB_APP entrypointとeditorのWeb App URLを確認。editor linkから開いたtabが当該`/exec`と一致 |
| execute-as | API `USER_DEPLOYING`、browserで所有者として実行 |
| access | API `MYSELF`、browserで「自分のみ」。access拡張なし |
| browser account | Apps Scriptのaccount表示がAPI principalと一致。browserで開いたprojectもAPI projectと一致 |
| observed execution | `/exec`の既存UIが描画し「面談入力の準備ができました」。実行履歴のversion 75 / Web Appに今回の`doGet`と4 bootstrapの完了を照合（browser表示2026-09-08 06:59:57–07:00:00） |

inventoryのWEB_APPは3件だが、全件数=1という条件は使用していない。HEADやhistorical version 27の共存をBLOCKERにしていない。projectのtrigger画面は0件。provider settings画面は開いていない。

## 最初のruntime failureと停止境界

identity確定後、inventoryに存在するExecution API経路を使い、private関数`getInstallationStatus_`のDEV状態・resource binding readbackを1回試みた。`scripts.run` / `devMode: true`はHTTP **403 `PERMISSION_DENIED`**で拒否され、function resultを取得できなかった。

分類は**runtime execution authorization boundary / BLOCKER**。Web App `/exec`自体の障害やapplication defectとは判定しない。403の詳細原因は未確定で、OAuth scope変更、GCP設定変更、API enablement、browser editorによる代替実行を同dispatchで試していない。成功したWeb App観測は、private Execution API権限の証明ではない。

source push、append-only setup、immutable version作成、既存deployment updateはすべて未実行。deployment mutation budgetは**0/1**。既存version 75をそのまま維持した。provider callが必要になったための停止ではなく、provider-independent private readbackの権限拒否による停止である。

## Target-runtime acceptance matrix

| 項目 | 結果 | 境界 |
|---|---|---|
| R1 schema 7 / 4列append / setup rerun | NOT RUN | setup前のprivate status readbackで403 |
| R2 GP / non-GP parent-first registration | NOT RUN | 新sourceをpushしていない |
| R3 tiny non-GP file / parent・counterparty metadata | NOT RUN | synthetic file作成なし |
| R4 existing Meetingへのfollow-up file追加 | NOT RUN | 同上 |
| R5 unlink/relink / stable IDs / status保全 | NOT RUN | relation mutationなし、physical delete 0 |
| R6 Docs全文exact equality / native Date・Time保全 | NOT RUN | 本文取得・relation mutationなし。mock testをlive証拠にしない |
| R7 独立Meeting-only全文出力 / invalid date / no result | NOT RUN | live preview未実行。local UIとlogicのみPASS |
| R8 provider calls / shared-admin・Gemini state | CALLS_0 / MUTATION_0 | provider/admin mutationなし。秘密・provider resource IDの抽出なし。state内容のbefore/after比較は未実行 |

Direct OpenAI / Gemini / Azure OpenAIへのprovider callは本dispatchで各0件。Actual File Search / citation runtime qualificationは**DEFERRED_TO_WORK_0030**。本dispatchのprovider-neutral testsはmetadata/citation logicの証拠であり、live provider PASSを意味しない。

## Side effects / 残件 / 次の担当

- Runtime: source push 0、setup 0、version creation 0、deployment mutation 0、business record/file write 0、physical delete 0、provider call 0、credential/access/trigger変更0。
- 本dispatch作成のsynthetic remote resourceは0。remote cleanupは不要。既存resourcesを削除・移動していない。
- Local: scoped source/testsとgenerated dist、reportをcommit。検証worktree・sanitized log・private identity evidenceはignored local領域に保持。秘密ID/URL/account/OAuth materialをGitHubへ返さない。
- GitHub: PR #51のみ更新。merge / ready-for-review / main管理文書更新なし。
- **BLOCKER**: private runtime readbackが403。R1–R7の認定は未完了。
- **FOLLOW_UP**: ChatGPTが次dispatchでprivate実行権限または既存承認済みeditor実行経路を正本として選定し、再度read-only identityを更新してから、同frozen sourceのR1–R8をboundedに実行する。権限拡張を自動で要求・適用しない。
- **FOLLOW_UP**: provider live qualificationはWork 0030。Light designは再議論しない。

## Shared Knowledge

KNOWLEDGE_RETRIEVAL: PAT-0004
KNOWLEDGE_APPLIED: PAT-0004
NEW_KNOWLEDGE_CANDIDATE: NO

canonical `origin/main`のPAT-0004を参照し、project / saved source / immutable version / deployment / browser executionを独立した証拠として確認した。
