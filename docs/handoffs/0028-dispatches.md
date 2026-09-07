# Work 0028 dispatch control

WORK_ID: 0028
DISPATCH_ID: 0028-CODEX-13
ACTIVE_DISPATCH_ID: 0028-CODEX-13
BALL: CODEX
STATUS: READY
MODE: BUILD
PHASE: B1.2 / PR #51 CONVERGENCE + TARGET RUNTIME QUALIFICATION

## Current state

PR #50のLight designはaccepted/merged済み。CODEX-12はDraft PR #51でproduction implementationを返却した。

- PR #51: `codex/0028-production-contract-build`
- returned HEAD: `2916cc7946626ec95ab46c2a70ffada9fc85f497`
- frozen CODEX-12 source: `f1c5cb7ae0e98c7ab68b78d5ddf9384caf0f09f7`
- schema: 7 / Pitchbook_Index 4 columns append
- Codex deterministic evidence: focused 485/485、`npm run check` 512/512、bundle 27/27、local production UI PASS
- target runtime: NOT RUN / BLOCKED at preflight automation selector
- source push / version / deployment mutation / runtime business write / provider call: 0

ChatGPT controller source review:
`docs/handoffs/0028-CODEX-12-controller-review.md`

Controller判定:

```text
CONTROLLER_SOURCE_REVIEW: PASS_WITH_BLOCKERS
MERGE_READY: NO
```

## BLOCKER

### B1 Prepare request finite lifetime

CODEX-12のprepare idempotencyは安全性を高めているが、成功済み`REQUEST_` propertyを永続保持しglobal 32件で新規allocationを拒否する。そのため正常利用でも32 batch後に資料登録不能になる。

CODEX-13で、安全なrecent replay/uncertain intent保持/duplicate防止を維持しつつbounded retention/compactionへ修復する。

### B2 Runtime identity / acceptance incomplete

CODEX-12のread-only preflightはApps Script inventory読取に成功したが、HEAD/旧版を含む3 WEB_APPを見てlocal checkerが全件数=1を要求し停止した。これはAUTOMATION_LIMITATIONでありApps Script defectではない。

CODEX-13は正しいidentity chainを固定し、必要なら1 deployment mutation以内でprovider-independent synthetic runtime acceptanceを行う。

## Primary Outcome

受入れ済みLight UIの主要production flowを、既存データを破壊せずtarget runtimeで証明する。

1. Meeting commit後にauthoritative Meeting_IDを発行。
2. saved Active Meetingをparentとしてnew file registration。
3. GP/non-GP Counterparty contextをPitchbook Indexへ保持。
4. partial failure / retryでstable IDs、no duplicate。
5. existing Meetingへfollow-up資料追加。
6. visible資料削除 = unlink、physical deleteなし。
7. relation-only mutationでauthoritative Meeting Docs本文を変更しない。
8. dedicated Meeting-only / non-AI Full Outputをruntimeで確認。
9. Work 0027 Gemini state / Work 0029 shared-adminを非破壊で維持。

## Azure provider Strategy adjustment

ユーザーは会社OpenAI-family providerがDirect OpenAIではなくAzure OpenAIであることを確定。Azure provider implementation/live File Search qualificationはWork 0030へ分離済み。

そのためCODEX-13では:

```text
Direct OpenAI provider calls: 0
Gemini provider calls: 0
Azure OpenAI provider calls: 0
actual File Search/citation runtime: DEFERRED_TO_WORK_0030
```

Work 0028ではprovider-neutral mapping/citation deterministic testsを保持し、target runtimeではauthoritative source/metadataまでを確認する。

Work 0030:
- `docs/decisions/company-azure-openai-provider.md`
- `docs/planning/work0030-azure-openai-provider-transition.md`

## Closed design / contract conclusions

- Light-only / sidebar 7 / accepted PR #50 visual family。
- single Meeting registration surface; no standalone Pitchbook route。
- single Past Records Meeting list/detail。
- new file requires parent Meeting first。
- non-GP registration allowed; no fake GP fill。
- relationship truth = `Meeting_Index.Related_Pitchbook_IDs`。
- relation-only add/remove does not rebuild Meeting Docs。
- historical orphan Pitchbook preserved; no auto parent inference。
- Knowledge Search primary target = 面談先/entityKey、source 3 options。
- Full Output = dedicated action、Meeting-only / non-AI、Docs全文 + business attributes、no Pitchbook body/reference-link section。
- analytics 9-column / GP+Entity summary / Work0029 shared-admin preserved。

## Authorization boundary

許可:
- PR #51 sourceのprepare lifecycle限定修正
- required tests
- exact-source regenerated dist
- synthetic/anonymized target-runtime writes/readback
- append-only schema setup
- necessary Web App mutation max 1 after identity proof

未許可:
- real confidential data
- broad rollout/access expansion
- physical delete/destructive migration
- historical bulk migration
- provider API calls
- secret/provider configuration mutation
- Gemini enablement
- Dark/System
- new DB/sheet/relationship table

Deployment/recoveryは`docs/operations/apps-script-web-app-deployment.md`を厳守。

## Evidence hierarchy

1. target Apps Script / Workspace authoritative readback
2. intended versioned WEB_APP `/exec` observed behavior
3. exact remote source / immutable version / bundle parity
4. deterministic tests
5. inference

## Dispatch history

| Dispatch | Disposition |
|---|---|
| 0028-CODEX-01 / 02 | Historical tombstone; never reuse |
| 0028-CODEX-03 | PR #40 / RETURNED PARTIAL |
| 0028-CODEX-04 | PR #41 / RETURNED |
| 0028-CODEX-05 | PR #42 / RETURNED |
| 0028-CODEX-06 | PR #43 / RETURNED |
| 0028-CODEX-07 | PR #44 / RETURNED |
| 0028-CODEX-08 | PR #45 / RETURNED / controller PASS |
| 0028-CODEX-09 | PR #46 / RETURNED / controller PASS |
| 0028-CODEX-10 | PR #47/#48/#49 / consumed history |
| 0028-CODEX-11 | PR #50 / returned -> controller repair -> user accepted -> merged |
| 0028-CODEX-12 | PR #51 / RETURNED PARTIAL / source review PASS_WITH_BLOCKERS |
| 0028-CODEX-13 | same PR #51 convergence / READY |

## Active instruction

`docs/handoffs/0028-CODEX-13-runtime-qualification-instruction.md`

Continue same branch/PR #51. New PRを作らない。main control docsをbranchから上書きしない。

## Completion gate

CODEX-13 return後、ChatGPTがfinal source diff、deterministic evidence、remote/source parity、runtime readbackをreviewする。

BLOCKER B1/B2が閉じ、provider-independent primary outcomeがruntimeで成立した場合、Work 0028をacceptしCompletion Latchを適用できる。Actual Azure provider runtimeはWork 0030へ継承する。

```text
THEME_SCOPE: LIGHT_ONLY
DESIGN_BASELINE: PR_50_MERGED
PR_51: OPEN_DRAFT
MODE: BUILD
ACTIVE_DISPATCH: 0028-CODEX-13
BALL: CODEX
STATUS: READY
PREPARE_LIFECYCLE_BLOCKER: OPEN
TARGET_RUNTIME_BLOCKER: OPEN
PROVIDER_RUNTIME: DEFERRED_TO_WORK_0030
PROVIDER_CALLS_AUTHORIZED: NO
PRODUCTION_IMPLEMENTATION_AUTHORIZED: YES
TARGET_RUNTIME_SYNTHETIC_QUALIFICATION_AUTHORIZED: YES
REAL_DATA_ROLLOUT_AUTHORIZED: NO
BROAD_DEPLOYMENT_AUTHORIZED: NO
NEXT_UNUSED_DISPATCH: 0028-CODEX-14
WORK_0028_COMPLETE: NO
```

WORK_ID: 0028
DISPATCH_ID: 0028-CODEX-13
BALL: CODEX
STATUS: READY
