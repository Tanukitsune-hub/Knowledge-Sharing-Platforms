# Work 0028 dispatch control

WORK_ID: 0028
DISPATCH_ID: 0028-CODEX-16
ACTIVE_DISPATCH_ID: 0028-CODEX-16
BALL: CODEX
STATUS: READY
MODE: BUILD
PHASE: B1.5 / STRATEGY RESET / FRESH BOUND TARGET QUALIFICATION

## Current state

PR #50のLight designはaccepted/merged済み。Draft PR #51でproduction implementationを収束中。

PR #51 current return:

- HEAD: `751df8350b9f08cb5a6650e5bd21d1e7793f8ab7`
- frozen source: `5842a07255a10415d39d524fd8ec174450248855`
- bundle commit: `2ab8b262c7211af5464f3201a77c6e45484cdc6c`
- focused 78/78 PASS
- canonical 515/515 PASS
- bundle 27/27 PASS
- prepare lifecycle blocker: CLOSED
- historical standalone saved source: frozen source 83/83 parity
- historical deployed `/exec`: immutable version75 unchanged
- provider calls: 0

CODEX-15はhistorical standalone Apps Script editorでprivate `getInstallationStatus_()` / `validateInstallation_()` / `setupKnowledgePlatform_()`の定義を確認したが、observed editor function selector / context menu / command surfaceから直接実行できずmutation前停止。

Controller review / Strategy Reset:
`docs/handoffs/0028-CODEX-15-controller-review.md`

```text
APPLICATION_DEFECT: NO
SOURCE_REPAIR_REQUIRED: NO
HISTORICAL_STANDALONE_STRATEGY: SUPERSEDED
STRATEGY_RESET: FRESH_CONTAINER_BOUND_QUALIFICATION
MERGE_READY: NO / target runtime evidence pending
```

## Strategy Reset

### Old strategy

historical standalone version75 Apps Script projectをschema7へmigrationし、同projectのexisting WEB_APPでR1-R8を認定する。

このstrategyはexecution surfaceの相違で3回停止した。

1. Execution API private call -> 403 permission boundary
2. container-bound installer -> standalone projectでexpected precondition
3. private editor functions -> observed editor UIのRun selectorに非表示

同targetへ別surfaceを追加する再試行は停止する。

### New strategy

Work0023で確定したfinal company install architectureと同じfresh container-bound targetを、isolated synthetic qualification environmentとして1件だけ作成する。

```text
isolated DEV folder
-> new Google Spreadsheet
-> container-bound Apps Script
-> exact generated bundle / manifest
-> installKnowledgeShare()
-> one owner-only WEB_APP deployment
-> security/readiness
-> verified /exec
-> provider-independent R1-R8
```

Historical standalone project/deploymentへCODEX-16で追加mutationしない。

## Primary Outcome

accepted Light UI + production backend contractがfinal target architectureでend-to-end成立することを証明する。

1. fresh container-bound installer succeeds / idempotent.
2. schema7 / 5-sheet backend / accepted resources established.
3. GP/non-GP Meeting parent-first registration.
4. parent-bound tiny file / metadata readback.
5. existing Meeting follow-up file add.
6. visible file delete=unlink / relink / stable IDs / physical delete 0.
7. relation-only mutation preserves authoritative Meeting Google Docs body exactly.
8. dedicated Meeting-only / non-AI Full Output works without AI provider.
9. provider calls 0 / AI sync disabled / owner-only qualification access.

## Accepted evidence retained

- PR #51 source direction
- schema7 4-column Pitchbook append contract
- prepare lifecycle bounded safety
- focused 78/78
- canonical 515/515
- bundle 27/27
- historical saved source parity 83/83

Do not re-open without direct contradiction from fresh target.

## Fresh target authorization boundary

Allowed:

- one isolated qualification folder
- one host Spreadsheet
- one container-bound Apps Script project
- one exact generated distribution install
- installer-created accepted resources inside isolated parent
- one owner-only qualification WEB_APP deployment
- synthetic/anonymized records/files/exports

Not allowed:

- real confidential data
- company/broad rollout
- access expansion beyond qualification owner
- existing historical version75 deployment mutation/rollback
- physical delete/destructive cleanup
- second qualification target in same dispatch
- Direct OpenAI/Gemini/Azure provider calls
- source repair in same dispatch unless a direct fresh-target application defect is first observed; on defect STOP and return

## Azure provider boundary

```text
Direct OpenAI calls: 0
Gemini calls: 0
Azure OpenAI calls: 0
actual File Search/citation runtime: DEFERRED_TO_WORK_0030
```

Fresh bound qualification target may be retained for Work0030 Azure synthetic qualification after Work0028 acceptance.

## Dispatch history

| Dispatch | Disposition |
|---|---|
| 0028-CODEX-01 / 02 | historical tombstone; never reuse |
| 0028-CODEX-03..09 | Light design iterations |
| 0028-CODEX-10 | PR #47/#48/#49 consumed history |
| 0028-CODEX-11 | PR #50 accepted/merged Light baseline |
| 0028-CODEX-12 | PR #51 production BUILD / deterministic PASS / runtime incomplete |
| 0028-CODEX-13 | prepare lifecycle blocker CLOSED / Execution API 403 |
| 0028-CODEX-14 | saved source push 83/83 / wrong bound-installer path |
| 0028-CODEX-15 | private editor Run path unavailable / historical strategy superseded |
| 0028-CODEX-16 | fresh container-bound target qualification / READY |

## Active instruction

`docs/handoffs/0028-CODEX-16-fresh-bound-runtime-qualification-instruction.md`

Continue same branch / Draft PR #51. New implementation PRを作らない。main control docsをbranchから上書きしない。

## Completion gate

CODEX-16がfresh bound installer + owner-only WEB_APP + R1-R8 runtime evidenceを返す。ChatGPTがfinal evidenceをreviewし、BLOCKERなしならPR #51をmergeしてWork0028へCompletion Latchを適用する。その後Work0030 Azure OpenAIへ進む。

```text
THEME_SCOPE: LIGHT_ONLY
DESIGN_BASELINE: PR_50_MERGED
PR_51: OPEN_DRAFT
MODE: BUILD
ACTIVE_DISPATCH: 0028-CODEX-16
BALL: CODEX
STATUS: READY
PREPARE_LIFECYCLE_BLOCKER: CLOSED
HISTORICAL_STANDALONE_RUNTIME_STRATEGY: SUPERSEDED
TARGET_RUNTIME_STRATEGY: FRESH_CONTAINER_BOUND
PROVIDER_RUNTIME: DEFERRED_TO_WORK_0030
PROVIDER_CALLS_AUTHORIZED: NO
REAL_DATA_ROLLOUT_AUTHORIZED: NO
BROAD_DEPLOYMENT_AUTHORIZED: NO
NEXT_UNUSED_DISPATCH: 0028-CODEX-17
WORK_0028_COMPLETE: NO
```

WORK_ID: 0028
DISPATCH_ID: 0028-CODEX-16
BALL: CODEX
STATUS: READY
