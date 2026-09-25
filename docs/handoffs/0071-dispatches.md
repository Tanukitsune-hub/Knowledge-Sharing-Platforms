# Work 0071 dispatch control

WORK_ID: 0071
ACTIVE_DISPATCH_ID: 0071-CODEX-03
BALL: CODEX
STATUS: READY
MODE: QUALIFICATION
VALIDATION_TIER: TIER_2_STANDARD
PHASE: PHASE_A_FINAL_INTEGRATION
USER_NATIVE_ACTION_BUDGET: 0
USER_PRESENCE_REQUIRED_BY_DEFAULT: NO

## Primary Outcome

非同期save/upload/status変化があっても、主要action・読位置・focus位置を探し直さなくてよいinteraction modelを、まず「記録を追加」4 sourceとshared file flowで完成させる。

## Closed Conclusions

- Work0070 release 0.2.0 / schema9はACCEPTED baseline。
- Work0049 busy feedback standardを維持する。
- Work0070 retry / unknown-outcome / concurrency / 4-tab stateを変更しない。
- selected Google Web UX KB rulesは `docs/product/work0071-google-web-ux-adoption.md` を正本とする。
- primary issueはfeedback不足ではなく、feedback/content追加によるgeometry movement。
- fullscreen overlay / fake progress / schema/provider changeはしない。
- CODEX-01はPhase A implementation + Phase B auditまで。Phase B surface-specific implementationは別Dispatch。
- development / qualificationはPC前のuser presenceを前提にしない。actual Web Appのautomated file injection + persisted readbackを優先し、OS picker操作は今回のAcceptanceに含めない。

## Dispatch Table

| Dispatch ID | Purpose | Mode | Ball | Status | Instruction | Report | Supersedes |
|---|---|---|---|---|---|---|---|
| 0071-CODEX-01 | before geometry -> Phase A stable interaction implementation -> isolated runtime qualification -> Phase B audit | BUILD | CHATGPT | RETURNED | `docs/handoffs/0071-CODEX-01-phase-a-interaction-stability-instruction.md` | `docs/handoffs/0071-CODEX-01-phase-a-interaction-stability-report.md` / Draft PR #104 | — |
| 0071-CODEX-02 | standalone status repair + vermilion file marker + review cleanup + focused requalification | BUILD | CHATGPT | RETURNED | `docs/handoffs/0071-CODEX-02-phase-a-repair-file-marker-instruction.md` | `docs/handoffs/0071-CODEX-02-phase-a-repair-file-marker-report.md` / Draft PR #104 | — |
| 0071-CODEX-03 | latest-main reconcile + canonical check + Phase A integration readiness | QUALIFICATION | CODEX | READY | `docs/handoffs/0071-CODEX-03-phase-a-final-integration-qualification-instruction.md` | pending | — |

## CODEX-01 ChatGPT review

Accepted evidence:

- before geometry measurements
- Phase A stable action/status shell
- Meeting / News / Assessment representative target-runtime saves
- 1440 / 390 geometry within target
- local 320 / 200% zoom / reduced-motion smoke
- Work0049 / Work0070 coupled regressions
- deterministic 716/716 PASS

BLOCKER / repair findings:

- standalone valid file selection does not clear stale primary no-file error; pending shows contradictory statuses
- user-approved vermilion file identity marker should be added to shared file queue
- unrelated root AGENTS.md compact rewrite must be reverted
- company package validation must not weaken accepted exact source/hash pinning
- Work0071 bundle must use a new patch release identity instead of reusing Work0070 release 0.2.0; target release = 0.2.1, schema remains 9

CODEX-02 performs only these repairs and one bounded isolated target-runtime requalification. Phase B remains FOLLOW_UP.

## CODEX-02 ChatGPT review

Accepted:

- standalone status source repair
- vermilion file identity marker
- release 0.2.1 / schema9
- exact distribution source/hash pin restoration
- focused browser and regression evidence
- exact candidate deployment/version identity
- user-native action budget 0 compliance

Classification:

- valid-file exact-candidate runtime state was not directly observed because the browser harness could not populate the file input.
- this is `AUTOMATION_LIMITATION`, not application-defect evidence.
- OS picker/native upload path is unchanged and prior accepted native-path evidence is reused.
- no user action and no further deployment is required for Phase A.

Main-side canonical-check blocker:

- CODEX-02 found root AGENTS.md over 12 KiB.
- ChatGPT repaired latest main without raising/weaking the validator; detailed unattended policy remains in the decision doc.
- CODEX-03 only reconciles latest main and reruns canonical deterministic gates. No runtime mutation.

## Authorization Boundary

Allowed:

- repository branch / source / tests / generated artifacts
- existing Work0070 isolated owner-only targetの確認・再利用
- same isolated deploymentのbounded candidate update
- synthetic test records/files

Not allowed:

- company production
- confidential/company data
- broad Web App access
- provider/indexing/billing
- permission changes
- schema/migration
- physical delete

## Completion Gate

CODEX-01 return後にChatGPTがbefore/after geometry、diff、browser/runtime evidenceをreviewする。

Work0071はまだACCEPTEDにしない。

WORK_ID: 0071
DISPATCH_ID: 0071-CODEX-03
BALL: CODEX
STATUS: READY
