# Work 0028 dispatch control

WORK_ID: 0028
DISPATCH_ID: 0028-CODEX-14
ACTIVE_DISPATCH_ID: 0028-CODEX-14
BALL: CODEX
STATUS: READY
MODE: BUILD
PHASE: B1.3 / EDITOR-APPROVED RUNTIME QUALIFICATION

## Current state

PR #50のLight designはaccepted/merged済み。PR #51でproduction implementationを収束中。

CODEX-13 return:

- PR #51 HEAD: `7b1241fc03c6bee6f7fb0ec0748aa3c1ae4bc577`
- frozen source: `5842a07255a10415d39d524fd8ec174450248855`
- bundle commit: `2ab8b262c7211af5464f3201a77c6e45484cdc6c`
- focused 78/78 PASS
- `npm run check` 515/515 PASS
- bundle 27/27 PASS
- prepare lifecycle: 160 batch、recent replay、retired-token rejection、unresolved INTENT保持、bounded propertiesを確認
- Apps Script identity chain: existing version 75 / WEB_APP `/exec`までpositive proof
- `scripts.run` private execution: HTTP 403 `PERMISSION_DENIED`
- runtime business primary flow: NOT RUN
- source/setup/version/deployment/business/provider mutation: 0

Controller review:
`docs/handoffs/0028-CODEX-13-controller-review.md`

Controller判定:

```text
CONTROLLER_SOURCE_REVIEW: PASS
PREPARE_LIFECYCLE_BLOCKER: CLOSED
TARGET_RUNTIME_PRIMARY_FLOW: NOT_RUN
MERGE_READY: NO
```

## Runtime execution-path conclusion

Google Apps Script Execution APIのpermissionを拡張して403を解消する経路は採らない。`scripts.run`はAPI executable、共通standard Cloud project、必要OAuth scopes等を要求し、Work 0028のWeb App runtime認定には不要な追加surfaceとなる。

Repository policyに従い、private setup/status/diagnosticsはprivacy boundaryを維持するeditor/trigger系で扱う。今回のapproved control path:

```text
Apps Script editor
  -> checkKnowledgeShareReadiness()
  -> installKnowledgeShare() only if required
  -> checkKnowledgeShareReadiness()
  -> confirmKnowledgeShareDeploymentSecurity() only if readiness requires it

verified versioned WEB_APP /exec
  -> normal public facades for business-flow acceptance
```

禁止:

- `getInstallationStatus_`等private `_` functionをExecution API / google.script.runで呼ぶ
- API executable追加
- OAuth scope/client拡張
- Cloud project変更
- public qualification wrapper追加

## Primary Outcome

受入れ済みLight UIの主要production flowをprovider-independent target runtimeで証明する。

1. schema 7 append-only setup/readback。
2. GP/non-GP Meeting parent-first登録。
3. parent Meeting確定後だけtiny file登録。
4. Pitchbook parent/counterparty metadata readback。
5. existing Meetingへfollow-up file追加。
6. visible資料削除=unlink、relink、stable IDs、physical delete 0。
7. relation-only mutation前後のauthoritative Meeting Google Docs本文exact equality。
8. dedicated Meeting-only / non-AI Full Output runtime確認。
9. Work 0027 Gemini disabled state / Work 0029 shared-admin securityを非破壊維持。

## Azure provider boundary

会社OpenAI-family providerはAzure OpenAI。provider runtimeはWork 0030へ分離済み。

CODEX-14:

```text
Direct OpenAI provider calls: 0
Gemini provider calls: 0
Azure OpenAI provider calls: 0
actual File Search/citation runtime: DEFERRED_TO_WORK_0030
```

Work 0030:
- `docs/decisions/company-azure-openai-provider.md`
- `docs/planning/work0030-azure-openai-provider-transition.md`

## Closed source / contract conclusions

- schema 7 / Pitchbook_Index 4-column append。
- 5-sheet backend維持、新relation tableなし。
- legacy orphan Pitchbook保持、auto-parent inferenceなし。
- Meeting-first parent binding。
- non-GP資料可、fake GP補完なし。
- file/link partial failure stable-ID recovery。
- relation truth = `Meeting_Index.Related_Pitchbook_IDs`。
- relation-only mutationでMeeting Docs再生成なし。
- parent-bound retrieval eligibility/citation logicはdeterministic evidenceとして保持。
- Full Output = dedicated Meeting-only / non-AI、Pitchbook body/reference-link sectionなし。
- accepted Light UI / analytics / summary / shared-adminを維持。

## Authorization / mutation bounds

許可:

- exact reviewed source push max 1
- append-only install/setup max 1
- immutable version create max 1
- positively identified existing WEB_APP deployment update max 1
- synthetic/anonymized business writes/readback
- editor-visible approved operator entrypoints

禁止:

- new deployment
- API executable
- second deployment attempt
- real confidential data
- broad rollout/access expansion
- physical delete/destructive migration
- provider calls/config mutation
- secret rotation
- Gemini enablement
- Dark/System
- new DB/sheet/relationship table

Runtime最初のfailureで停止する。

## Evidence hierarchy

1. target Apps Script / Workspace authoritative readback
2. intended versioned WEB_APP `/exec` browser behavior / execution history
3. exact remote saved source / immutable version / bundle parity
4. accepted deterministic tests
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
| 0028-CODEX-13 | PR #51 / RETURNED / prepare blocker CLOSED / Execution API 403 |
| 0028-CODEX-14 | same PR #51 / editor-approved runtime qualification / READY |

## Active instruction

`docs/handoffs/0028-CODEX-14-editor-runtime-qualification-instruction.md`

Continue same branch / PR #51。New PRを作らない。main control docsをbranchから上書きしない。

## Completion gate

CODEX-14 return後、ChatGPTがruntime evidence / deployed-source continuity / side effectsをreviewする。

R1–R8がprovider-independent target runtimeで成立すればPR #51をmergeし、Work 0028へCompletion Latchを適用できる。Actual Azure provider runtimeはWork 0030へ継承する。

```text
THEME_SCOPE: LIGHT_ONLY
DESIGN_BASELINE: PR_50_MERGED
PR_51: OPEN_DRAFT
MODE: BUILD
ACTIVE_DISPATCH: 0028-CODEX-14
BALL: CODEX
STATUS: READY
PREPARE_LIFECYCLE_BLOCKER: CLOSED
EXECUTION_API_403: ROUTED_AROUND_BY_APPROVED_EDITOR_PATH
TARGET_RUNTIME_BLOCKER: OPEN
PROVIDER_RUNTIME: DEFERRED_TO_WORK_0030
PROVIDER_CALLS_AUTHORIZED: NO
PRODUCTION_IMPLEMENTATION_AUTHORIZED: YES
TARGET_RUNTIME_SYNTHETIC_QUALIFICATION_AUTHORIZED: YES
REAL_DATA_ROLLOUT_AUTHORIZED: NO
BROAD_DEPLOYMENT_AUTHORIZED: NO
NEXT_UNUSED_DISPATCH: 0028-CODEX-15
WORK_0028_COMPLETE: NO
```

WORK_ID: 0028
DISPATCH_ID: 0028-CODEX-14
BALL: CODEX
STATUS: READY
