# Work 0028 dispatch control

WORK_ID: 0028
DISPATCH_ID: 0028-CODEX-15
ACTIVE_DISPATCH_ID: 0028-CODEX-15
BALL: CODEX
STATUS: READY
MODE: BUILD
PHASE: B1.4 / STANDALONE EDITOR RUNTIME QUALIFICATION

## Current state

PR #50のLight designはaccepted/merged済み。Draft PR #51でproduction implementationを収束中。

CODEX-14 return:

- PR #51 HEAD: `0aeced527ca0efe93d41c337dc10db17613b79cc`
- frozen source: `5842a07255a10415d39d524fd8ec174450248855`
- bundle commit: `2ab8b262c7211af5464f3201a77c6e45484cdc6c`
- prepare lifecycle: CLOSED / 160 batch continuity等のAccepted Evidence維持
- focused 78/78、canonical 515/515、bundle 27/27 PASSをAccepted Evidenceとして保持
- frozen modular sourceをexisting Apps Script projectへ1回push済み
- remote saved source parity: 83/83 PASS
- existing WEB_APP `/exec`: version 75のまま、deployment mutation 0
- `checkKnowledgeShareReadiness()` -> `INSTALLER_BOUND_SPREADSHEET_REQUIRED`
- setup / version create / deployment update / business write / provider call: 0
- R1–R8: NOT RUN

Controller review:
`docs/handoffs/0028-CODEX-14-controller-review.md`

Controller classification:

```text
CONTROLLER_CLASSIFICATION: EXPECTED_INSTALLER_PRECONDITION / WRONG_OPERATOR_FOR_TARGET
APPLICATION_DEFECT: NO
INSTALLER_DEFECT: NO
PREPARE_LIFECYCLE_BLOCKER: CLOSED
TARGET_RUNTIME_PRIMARY_FLOW: NOT_RUN
MERGE_READY: NO
```

## Runtime execution-path conclusion

`installKnowledgeShare()` / `checkKnowledgeShareReadiness()` / `confirmKnowledgeShareDeploymentSecurity()`は、Work 0023で確定したfresh company install用container-bound Spreadsheet installerである。bound Spreadsheetからparent folder・owner/statusを確定するsecurity contractを持つため、既存standalone targetに合わせてguardを緩和しない。

既存version 75 projectはstandalone Apps Script targetとして過去Workから継続している。Repository policyに従い、standalone-compatible private core operatorをApps Script editorから直接使用する。

```text
Apps Script editor / existing standalone project
  -> getInstallationStatus_()
  -> validateInstallation_()
  -> setupKnowledgePlatform_() only if proven-safe append-only schema migration is required
  -> validateInstallation_()

then
  -> immutable version create exactly once
  -> positively identified existing WEB_APP update exactly once
  -> verified /exec
  -> provider-independent synthetic R1-R8
```

禁止:

- installer wrapperをstandalone targetで再使用
- installer guardの削除/緩和
- private `_` functionをExecution API / google.script.runで呼ぶ
- API executable追加
- OAuth scope/client拡張
- Cloud project変更
- public qualification wrapper追加

## Primary Outcome

受入れ済みLight UIの主要production flowをprovider-independent target runtimeで証明する。

1. existing installation continuityをstandalone editor private pathで確認。
2. schema 7 append-only setup/readback。
3. GP/non-GP Meeting parent-first登録。
4. parent Meeting確定後だけtiny file登録。
5. Pitchbook parent/counterparty metadata readback。
6. existing Meetingへfollow-up file追加。
7. visible資料削除=unlink、relink、stable IDs、physical delete 0。
8. relation-only mutation前後のauthoritative Meeting Google Docs本文exact equality。
9. dedicated Meeting-only / non-AI Full Output runtime確認。
10. Work 0027 Gemini disabled state / Work 0029 shared-admin securityを非破壊維持。

## Azure provider boundary

会社OpenAI-family providerはAzure OpenAI。provider runtimeはWork 0030へ分離済み。

CODEX-15:

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
- prepare request lifecycleはboundedで通常利用32回制限なし。
- relation truth = `Meeting_Index.Related_Pitchbook_IDs`。
- relation-only mutationでMeeting Docs再生成なし。
- parent-bound retrieval eligibility/citation logicはdeterministic Accepted Evidenceとして保持。
- Full Output = dedicated Meeting-only / non-AI、Pitchbook body/reference-link sectionなし。
- accepted Light UI / analytics / summary / shared-adminを維持。
- company fresh installのcontainer-bound installer architectureを変更しない。

## Authorization / mutation bounds

許可:

- source push: 0 remaining（CODEX-14で1回消費済み）
- standalone editor private status/validation reads
- append-only `setupKnowledgePlatform_()` max 1 after continuity proof
- immutable version create max 1
- positively identified existing WEB_APP deployment update max 1
- synthetic/anonymized business writes/readback through normal `/exec`

禁止:

- source再push
- second setup
- new deployment
- second version/deployment attempt
- Execution API
- real confidential data
- broad rollout/access expansion
- physical delete/destructive migration
- provider calls/config mutation
- secret rotation
- Gemini enablement
- Dark/System
- new DB/sheet/relationship table

Runtime mutation開始後の最初のfailureで停止する。

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
| 0028-CODEX-14 | PR #51 / RETURNED / source push+83/83 parity / bound-installer precondition |
| 0028-CODEX-15 | same PR #51 / standalone editor runtime qualification / READY |

## Active instruction

`docs/handoffs/0028-CODEX-15-standalone-runtime-qualification-instruction.md`

Continue same branch / PR #51。New PRを作らない。main control docsをbranchから上書きしない。

## Completion gate

CODEX-15 return後、ChatGPTがinstallation continuity、schema migration、deployed-source continuity、R1–R8、side effectsをreviewする。

R1–R8がprovider-independent target runtimeで成立すればPR #51をmergeし、Work 0028へCompletion Latchを適用できる。Actual Azure provider runtimeはWork 0030へ継承する。

```text
THEME_SCOPE: LIGHT_ONLY
DESIGN_BASELINE: PR_50_MERGED
PR_51: OPEN_DRAFT
MODE: BUILD
ACTIVE_DISPATCH: 0028-CODEX-15
BALL: CODEX
STATUS: READY
PREPARE_LIFECYCLE_BLOCKER: CLOSED
EXECUTION_API_403: CLOSED_AS_WRONG_SURFACE
BOUND_INSTALLER_ERROR: CLOSED_AS_EXPECTED_PRECONDITION
TARGET_RUNTIME_BLOCKER: OPEN
PROVIDER_RUNTIME: DEFERRED_TO_WORK_0030
PROVIDER_CALLS_AUTHORIZED: NO
PRODUCTION_IMPLEMENTATION_AUTHORIZED: YES
TARGET_RUNTIME_SYNTHETIC_QUALIFICATION_AUTHORIZED: YES
REAL_DATA_ROLLOUT_AUTHORIZED: NO
BROAD_DEPLOYMENT_AUTHORIZED: NO
NEXT_UNUSED_DISPATCH: 0028-CODEX-16
WORK_0028_COMPLETE: NO
```

WORK_ID: 0028
DISPATCH_ID: 0028-CODEX-15
BALL: CODEX
STATUS: READY
