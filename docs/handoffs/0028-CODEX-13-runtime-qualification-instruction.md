# CODEX-13 — prepare lifecycle repair + provider-independent target-runtime qualification

WORK_ID: 0028
DISPATCH_ID: 0028-CODEX-13
BALL: CODEX
STATUS: READY
MODE: BUILD
PHASE: B1.2 / PR #51 CONVERGENCE + TARGET RUNTIME QUALIFICATION

## Primary Outcome

PR #51のproduction実装を安全に収束させる。

1. 正常利用が32 batchで停止するprepare request retention BLOCKERを解消する。
2. deterministic / bundle evidenceを再取得する。
3. Apps Script identity chainを正しく固定する。
4. provider callを伴わないsynthetic primary flowをtarget runtimeでend-to-end確認する。
5. PR #51をChatGPTがmerge可否判断できる状態で返す。

## Start point

Repository: `Tanukitsune-hub/Knowledge-Sharing-Platforms`

Continue existing branch / Draft PR:

```text
branch: codex/0028-production-contract-build
PR: #51
returned HEAD: 2916cc7946626ec95ab46c2a70ffada9fc85f497
frozen CODEX-12 source: f1c5cb7ae0e98c7ab68b78d5ddf9384caf0f09f7
```

最新`origin/main`をfetchし、以下をread-only正本として確認する。

- `docs/handoffs/0028-CODEX-12-controller-review.md`
- 本instruction
- `docs/operations/apps-script-web-app-deployment.md`
- applicable `AGENTS.md`
- `docs/decisions/company-azure-openai-provider.md`

PR branchへmainをmerge/rebaseしてcontrol/historyを上書きしない。`docs/handoffs/0028-dispatches.md`と`docs/planning/work-registry.md`はChatGPT管理のため、本dispatchではbranch側から更新しない。

## Closed Conclusions

- PR #51のparent-first、non-GP、relation-only、eligibility/citation、Full Output、Light UIの方向はcontroller source reviewで受入れ可能。
- schema 7の4列appendを維持。新sheet / new relationship table / bulk parent inferenceなし。
- legacy orphan Pitchbookは保持。
- visible file `削除` = current Meetingからunlink。Pitchbook-wide Inactive/physical deleteではない。
- relation-only mutationはMeeting Google Docs本文を変更しない。
- Direct OpenAIは会社providerではない。Azure provider live qualificationはWork 0030へ分離済み。
- 本dispatchではDirect OpenAI / Gemini / Azure OpenAIのprovider callを行わない。provider-neutral deterministic testsだけを維持する。

## BLOCKER A — prepare request lifecycle

現行`src/81_PitchbookReservationAdapters.gs`は成功済み`REQUEST_` recordを保持し続け、global 32件で新しいprepareを拒否するため修正必須。

### Required behavior

- uncertain / unresolved `INTENT`は自動削除しない。
- recent idempotent replayは同じrequestIdから同じBatch_ID / Document_ID群をreadbackできる。
- 正常完了したrequestはboundedなretention/compactionにより通常利用を永久に32回へ制限しない。
- 古いretired requestIdを再送してduplicate allocationを黙って作らない。
- Script Propertiesを無制限に増加させない。
- safetyを弱める単純な`COMPLETE`削除だけの修正は禁止。必要ならcompact tombstone / bounded retired-token guard等を最小構成で使う。
- operator recoveryが必要なuncertain stateは明示的にfail-closedする。

### Required tests

最低限:

1. 32件を超える連続successful prepare/new batchが継続可能。
2. retention window内の同requestId replay -> exact same IDs / no counter advance / no duplicate rows。
3. unresolved INTENTはretention cleanupで消えず、新規allocation safetyを維持。
4. retired/expired requestId再送はduplicateを作らない（safe rejectionまたはexact-safe behavior）。
5. retained properties/tombstonesはbounded。
6. existing lost-response/readback/partial-write testsを退行させない。

Implementation detailはCodexが最小安全案を選ぶ。新DB/sheetは不可。

## Deterministic gates after repair

順序:

1. targeted prepare/retry/Meeting relation/provider-neutral tests
2. `npm run check`
3. exact-source `dist/**` regenerate
4. `npm run check:bundle`
5. `git diff --check`
6. secret/private-ID scan

生成`dist`は手編集しない。

## Runtime identity chain

CODEX-12は全WEB_APP件数=1というlocal selection ruleで停止した。このruleをtarget identity判定に使わない。

sourceをfreezeしたままread-onlyで次を個別に固定する。

```text
Git ref
-> local tested source
-> Apps Script project
-> remote saved source
-> immutable version/source
-> intended deployment
-> entrypoint type = WEB_APP
-> intended /exec
-> execute-as / access
-> browser account
-> observed current execution
```

HEAD / historical version27 / version75等が同inventoryに存在すること自体を曖昧性としない。候補はversion/descriptionだけで決めず、project/deployment/entrypoint/account/source continuityを合わせてpositive proofする。

identity chainのいずれかが不一致・不明なら、source/deployment mutation 0のまま停止してRETURNする。

## One bounded runtime mutation path

identityが完全に固定できた場合のみ実行。

- application source push / append-only setup / immutable version / deployment updateの必要最小経路を選ぶ。
- existing deploymentを更新する場合、事前にそのtargetが`WEB_APP` + intended `/exec`とpositive proof済みであること。
- Library/ambiguous deploymentを触らない。
- deployment mutation budgetは最大1回。
- 最初のruntime failureで停止。別deployment作成や第二修正を同runで行わない。
- real confidential data、real user rollout、access expansion禁止。

## Synthetic runtime acceptance matrix

provider APIを使わず、isolated synthetic/anonymized resourcesだけで確認する。

### R1 Schema/setup

- schema 7 readback。
- Pitchbook_Indexに4列がappendされ、既存列/既存synthetic baseline値が保全。
- setup rerun idempotent。

### R2 Parent-first registration

- synthetic GP Meetingを登録。
- synthetic non-GP Meetingを登録。
- each Meeting_ID / Version / Docs identity readback。
- parent commit前にfile registrationが起きないこと。

### R3 New parent-bound file

- tiny allowed synthetic fileをnon-GP parentへ追加。
- same Meeting_ID parent、stable Document_ID、Drive file、Pitchbook rowをreadback。
- `Parent_Meeting_ID / Counterparty_Type / Counterparty_ID / Related_GP_IDs`がauthoritative parent contextと一致。
- GP_IDをnon-GPへ架空補完しない。

### R4 Existing Meeting follow-up

- 同じMeetingへ2件目のtiny synthetic fileを後日追加。
- 新しいMeetingを作らない。
- new Document_IDのみ発行。

### R5 unlink / relink

- relation-only `削除` / relink。
- stable Meeting_ID / Document_ID / Drive fileを維持。
- physical delete 0。
- Pitchbook-wide statusを意図せずReactivate/Inactive化しない。
- current relation listをauthoritative readback。

### R6 Google Docs body preservation

- relation-only mutation直前のauthoritative Meeting Google Docs全文を取得。
- unlink/relink後の同Doc全文を再取得。
- exact text equalityをrequire。IndexのDate/Time/other business fieldsも不変。

### R7 Independent Full Output

- AI question/modelを設定せず、synthetic Meeting条件でpreview。
- target Meeting count/scope/attributes/authoritative Docs bodyをreadback。
- Pitchbook body / Pitchbook reference-link sectionがpackageにない。
- invalid date / no result / boundsの既存safe behaviorを少なくともboundedに確認。

### R8 Integrity

- Work 0027 Gemini enabled stateを変更しない。
- Work 0029 shared-admin credential/session contractを変更しない。
- provider calls: 0。
- Direct OpenAI credential/config/resource IDsをread/use/mutateしない。
- Azure OpenAI credential/configも本dispatchでは使わない。

## Provider runtime boundary

Actual File Search / citation live E2EはWork 0030へ明示的にDEFERする。

本dispatchでのaccepted evidenceは、non-GP/provider metadata/citation logicのdeterministic tests + target runtimeのauthoritative source metadataまで。

`READY`判定でAzure/OpenAI/Geminiのlive File Search PASSを要求しない。ただしprovider callを行っていないことをreportする。

## Cleanup

Synthetic resourcesは、identityとaudit evidenceを壊さず安全にcleanup可能な範囲で片付ける。cleanupが安全でない場合は追加mutationせず、残存synthetic resource typeだけを秘密IDなしでreportする。

## Bounds / Strategy Reset

- source repair round: 1（prepare lifecycle only）
- post-repair focused/canonical verification: 1 full pass
- deployment mutation: max 1
- runtime primary-flow execution: 1 bounded pass
- same failure repeat、identity contradiction、unexpected schema/data mutation、provider callが必要になった場合は停止してStrategy Reset。

## Required report

Create/update on PR #51 branch:

`docs/handoffs/0028-CODEX-13-runtime-qualification-report.md`

必ず分離して記載:

```text
LOGIC_VALIDATION
BUNDLE_VALIDATION
TARGET_RUNTIME_QUALIFICATION
PROVIDER_RUNTIME_QUALIFICATION: DEFERRED_TO_WORK_0030 / CALLS_0
SIDE_EFFECT_STATE
BLOCKER
READY
```

source commit / bundle commit / target-runtime exact tested refを固定し、private IDs/URLs/accounts/credentialsを記載しない。

Return:

```text
WORK_ID: 0028
DISPATCH_ID: 0028-CODEX-13
BALL: CHATGPT
STATUS: RETURNED
MODE: BUILD
```
