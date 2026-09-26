# Work 0071 dispatch control

WORK_ID: 0071
ACTIVE_DISPATCH_ID: 0071-CODEX-04
BALL: CHATGPT
STATUS: RETURNED
MODE: BUILD
VALIDATION_TIER: TIER_2_STANDARD
PHASE: PHASE_B_FOCUS_RECOVERY
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
| 0071-CODEX-03 | latest-main reconcile + canonical check + Phase A integration readiness | QUALIFICATION | CHATGPT | RETURNED | `docs/handoffs/0071-CODEX-03-phase-a-final-integration-qualification-instruction.md` | `docs/handoffs/0071-CODEX-03-phase-a-final-integration-qualification-report.md` / PR #104 | — |
| 0071-CODEX-04 | Phase B focus continuity + Past edit validation recovery | BUILD | CHATGPT | RETURNED | `docs/handoffs/0071-CODEX-04-phase-b-focus-recovery-instruction.md` | `docs/handoffs/0071-CODEX-04-phase-b-focus-recovery-report.md` / Draft PR pending | — |

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

## Phase A integration

ChatGPT final review: PASS.

```text
PR: #104
MERGE: e9c759c569660331a1eb447cd44787ab1051c427
RELEASE: 0.2.1
SCHEMA: 9
PHASE_A_LOGIC_VALIDATION: PASS
CANONICAL_CHECK: PASS
PHASE_A_INTEGRATION_READY: YES
BLOCKER: NONE
USER_ACTION_REQUIRED: NO
```

The valid-file exact-candidate runtime state remains `NOT_OBSERVED_AUTOMATION_LIMITATION`; this limitation is preserved rather than rewritten as a direct PASS. Prior native-upload evidence is reused because the native picker/upload transport/server persistence semantics were not changed.

Phase A is integrated and closed unless material contradictory evidence appears. Work0071 overall remains ACTIVE for evidence-gated Phase B.

## CODEX-04 return

Current main の4 finding は production HTML を使った synthetic browser で `REPRODUCED_MATERIAL`。修正後の 1440/390/320 focus/validation browser、canonical 717/717、0.2.2/schema9 bundle と7-file exact parity は PASS。隔離 target の現在の identity を独立確認できず、source sync / version / deployment update は0。`TARGET_RUNTIME_QUALIFICATION: NOT RUN`、`BLOCKER: TARGET_IDENTITY_UNCONFIRMED`、`READY: NO`。Phase A acceptance は再度開かず、Work0071 の ACCEPTED / Completion Latch は未適用。ChatGPT 最終 review 待ち。

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

CODEX-03 return: latest main normal merge後もPhase A sourceと0.2.1/schema9 distribution identityは不変。agent foundation、`npm run check` 717/717、diff hygieneはPASS。valid-file exact-candidate runtime stateの未直接観測は`AUTOMATION_LIMITATION`として明記し、ChatGPT判断によりPhase A integrationの非BLOCKERとする。CODEX-03のruntime mutationとuser native actionは0。Phase A integration ready、Work全体のACCEPTED判定は未実施。

WORK_ID: 0071
DISPATCH_ID: 0071-CODEX-04
BALL: CHATGPT
STATUS: RETURNED
