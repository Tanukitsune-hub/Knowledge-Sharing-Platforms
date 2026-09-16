# Work 0028 dispatch control

WORK_ID: 0028
DISPATCH_ID: 0028-CODEX-18
ACTIVE_DISPATCH_ID: 0028-CODEX-18
BALL: CODEX
STATUS: READY
MODE: BUILD
PHASE: B1.6 / INSTALLER IDENTITY SCOPE REPAIR / FRESH BOUND QUALIFICATION

## Current state

PR #50のLight designはaccepted/merged済み。Draft PR #51でproduction implementationとtarget-runtime qualificationを収束中。

PR #51 current return:

```text
HEAD: 5188d4497c4d626adbc6d8c67e1fbb9630404dfd
CODEX16_RECOVERY_STATE: NOT_STARTED_CONFIRMED
fresh qualification target: 1
accepted source installed: 1
initial installer execution: 1
execution history: completed
installation status sheet: absent
Backend / installer-created resources: absent
Script Properties after I1: empty
qualification deployment: 0
R1-R8: NOT_RUN
provider calls: 0
READY: NO
```

CODEX-17は初回installerが受入条件を満たさなかった最初のnon-consent failureで停止し、同run修正・再実行・deployment作成を行わなかった。この停止判断はChatGPT reviewでaccepted。

Controller review:
`docs/handoffs/0028-CODEX-17-controller-review.md`

## Accepted evidence retained

反証がない限り以下を再び開かない。

- PR #50 Light design accepted/merged
- PR #51 provider-independent production direction
- schema7 / Pitchbook 4-column append contract
- prepare lifecycle blocker CLOSED
- pre-repair focused 78/78 PASS
- pre-repair canonical 515/515 PASS
- pre-repair bundle 27/27 PASS
- CODEX-17 fresh bound target identity / exact source-install evidence
- historical standalone saved source frozen-source parity
- historical version75 qualification strategy SUPERSEDED

## Active blocker and hypothesis

Observed blocker:

```text
BLOCKER: INITIAL_INSTALL_COMPLETED_WITHOUT_INSTALLATION_OUTPUTS
```

Source review narrows the stop to the initial installer authorization/identity path before setup mutation. The explicit Apps Script manifest does not include `https://www.googleapis.com/auth/userinfo.email`; live `getSessionIdentities()` depends on `Session.getActiveUser().getEmail()` / `Session.getEffectiveUser().getEmail()` and converts retrieval exceptions to empty strings. The early authorization catch returns `ACTION_REQUIRED` without persisting the installation status sheet.

Active Hypothesis for CODEX-18:

```text
missing userinfo.email scope -> installer identity unavailable
-> initial authorization gate fails closed before setup mutation
```

This is not yet a confirmed root cause because CODEX-17 did not directly observe the returned safe error code.

## CODEX-18 scope

Use the existing CODEX-17 fresh bound target only. New target creation is forbidden.

CODEX-18 may:

1. add the minimum `userinfo.email` scope through the canonical manifest source/generator;
2. add minimal safe error-code observability without logging personal/private identifiers or weakening fail-closed identity controls;
3. add focused regression tests;
4. regenerate deterministic distribution and run focused + canonical validation;
5. sync repaired exact source/manifest to the existing bound project once;
6. after any required user OAuth consent, execute repaired I1 once;
7. only after I1 PASS, execute I2 idempotency once, create one owner-only WEB_APP, then run R1-R8 once.

If repaired I1 still fails, do not perform a second repair/retry in the same Dispatch.

Active instruction:
`docs/handoffs/0028-CODEX-18-installer-identity-scope-repair-instruction.md`

## Fresh target / mutation boundary

```text
new target: 0
existing target source update: max 1
repaired I1: max 1
I2 after I1 PASS: max 1
qualification WEB_APP after installer PASS: max 1
second deployment: 0
R1-R8 campaign: one bounded pass
historical standalone mutation: 0
physical delete: 0
real confidential data: 0
```

If Google OAuth/native UI interaction is required, keep the same Dispatch ID and return `BALL: USER / STATUS: ACTION_REQUIRED`.

## Provider / Azure boundary

User decision 2026-09-17: Azure OpenAI transition is deferred.

```text
Direct OpenAI calls: 0
Gemini calls: 0
Azure OpenAI calls: 0
AI sync: disabled
provider File Search/citation runtime: OUT_OF_SCOPE
WORK_0030: DEFERRED_BY_USER
```

Work 0028 completion does not automatically activate Work 0030.

## Dispatch history

| Dispatch | Disposition |
|---|---|
| 0028-CODEX-01 / 02 | historical tombstone; never reuse |
| 0028-CODEX-03..09 | Light design iterations |
| 0028-CODEX-10 | PR #47/#48/#49 consumed history |
| 0028-CODEX-11 | PR #50 accepted/merged Light baseline |
| 0028-CODEX-12 | PR #51 production BUILD / deterministic PASS / runtime incomplete |
| 0028-CODEX-13 | prepare lifecycle blocker CLOSED / Execution API 403 |
| 0028-CODEX-14 | saved source parity / standalone mismatch |
| 0028-CODEX-15 | historical standalone strategy superseded |
| 0028-CODEX-16 | interrupted / no durable return |
| 0028-CODEX-17 | recovery + fresh target + initial installer runtime failure / ACCEPTED |
| 0028-CODEX-18 | bounded identity-scope repair + existing-target qualification / READY |

## Completion gate

CODEX-18が、existing target上でrepaired installer + idempotency + one owner-only WEB_APP + provider-independent R1-R8のreviewable evidenceを返す。

ChatGPTがfinal evidence/diffをreviewし、BLOCKERなしならPR #51を収束・mergeしてWork 0028へCompletion Latchを適用する。その後は開発を止め、ユーザーの実機確認へ進む。Work 0030はDEFERREDのまま。

```text
THEME_SCOPE: LIGHT_ONLY
DESIGN_BASELINE: PR_50_MERGED
PR_51: OPEN_DRAFT
ACTIVE_DISPATCH: 0028-CODEX-18
BALL: CODEX
STATUS: READY
TARGET_RUNTIME_STRATEGY: REPAIR_THEN_RESUME_EXISTING_FRESH_BOUND_TARGET
ACTIVE_BLOCKER: INITIAL_INSTALL_COMPLETED_WITHOUT_INSTALLATION_OUTPUTS
ACTIVE_HYPOTHESIS: MISSING_USERINFO_EMAIL_SCOPE
NEW_TARGET_AUTHORIZED: NO
PROVIDER_CALLS_AUTHORIZED: NO
WORK_0030: DEFERRED_BY_USER
NEXT_UNUSED_DISPATCH: 0028-CODEX-19
WORK_0028_COMPLETE: NO
```

WORK_ID: 0028
DISPATCH_ID: 0028-CODEX-18
BALL: CODEX
STATUS: READY
