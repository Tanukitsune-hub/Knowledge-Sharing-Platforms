# CODEX-18 — installer identity scope repair and fresh-bound qualification resume

WORK_ID: 0028
DISPATCH_ID: 0028-CODEX-18
BALL: CODEX
STATUS: READY
MODE: BUILD
PHASE: B1.6 / INSTALLER IDENTITY SCOPE REPAIR / FRESH BOUND QUALIFICATION

## Primary Outcome

CODEX-17で保持したsingle fresh container-bound qualification targetを再利用し、初回installerがside-effect前に停止した原因を最小修正で解消する。その後、同targetでinstaller idempotency、owner-only WEB_APP、provider-independent R1-R8までend-to-end認定する。

Work 0028の完了後は停止する。Azure OpenAI / Work 0030はユーザー判断によりDEFERREDであり、開始・準備しない。

## Start point

Repository:
`Tanukitsune-hub/Knowledge-Sharing-Platforms`

Continue existing branch / Draft PR #51:

```text
branch: codex/0028-production-contract-build
PR: #51
CODEX-17 return head: 5188d4497c4d626adbc6d8c67e1fbb9630404dfd
accepted frozen source before repair: 5842a07255a10415d39d524fd8ec174450248855
accepted bundle commit before repair: 2ab8b262c7211af5464f3201a77c6e45484cdc6c
```

Read first from latest `origin/main` without merging/rebasing main merely to import control docs:

- `AGENTS.md`
- `tests/AGENTS.md`
- `docs/agent-governance/dispatch-control.md`
- `docs/handoffs/0028-CODEX-17-controller-review.md`
- `docs/handoffs/0028-CODEX-17-interrupted-runtime-recovery-report.md` from PR #51 branch
- this instruction
- `docs/handoffs/0028-dispatches.md`
- `docs/operations/apps-script-web-app-deployment.md`
- `docs/decisions/modular-source-single-bundle-distribution.md`

Do not merge/rebase/reset PR #51 against main in this Dispatch. ChatGPT owns final PR convergence.

## Accepted target-runtime evidence from CODEX-17

Preserve:

```text
CODEX16_RECOVERY_STATE: NOT_STARTED_CONFIRMED
TARGET_CREATED: 1
SOURCE_INSTALL: 1
INSTALLER_I1_EXECUTION: 1
INSTALLER_EXECUTION_HISTORY: COMPLETED
INSTALLATION_STATUS_SHEET: ABSENT
BACKEND_AND_INSTALLER_RESOURCES: ABSENT
SCRIPT_PROPERTIES_AFTER_I1: EMPTY
TRIGGERS: 0
QUALIFICATION_WEB_APP: 0
TARGET_RUNTIME_R1_R8: NOT_RUN
PROVIDER_CALLS: 0
```

The exact fresh target must be reused. Do not create another folder, Spreadsheet, Apps Script project, or qualification target.

## Active Hypothesis

Use exactly one active hypothesis until evidence accepts or rejects it:

```text
The explicit Apps Script manifest omits https://www.googleapis.com/auth/userinfo.email,
so the fresh bound editor execution cannot obtain the installer identity required by
kspAuthorizeAndLatchInstaller_(), causing a fail-closed ACTION_REQUIRED return before
any resource/status/property mutation.
```

Why this is plausible:

- `installKnowledgeShare()` only returns `kspRunInstaller_(...)`.
- the initial installer authorization gate returns an `ACTION_REQUIRED` status object on identity failure before setup mutation.
- that early path does not persist `KnowledgeShare_Installation` status.
- live `getSessionIdentities()` converts identity-read exceptions to empty strings.
- the accepted explicit manifest does not currently include `userinfo.email`.
- CODEX-17 observed exactly: editor execution completed, but resources/status/properties remained absent.

Do not report this as confirmed root cause until target-runtime evidence after repair proves the path.

## Phase A — bounded source diagnosis and repair

### A1 Canonical manifest path

Locate the canonical manifest source/generator that produces `dist/appsscript.json`.

Do not hand-edit generated `dist/appsscript.json` as the only fix.

Add the minimum required identity scope:

```text
https://www.googleapis.com/auth/userinfo.email
```

Preserve all existing scopes and least-privilege posture.

### A2 Safe installer observability

Add the smallest durable observability needed to distinguish early installer authorization failures in the target editor execution.

Requirements:

- expose/log only safe state/error code needed for diagnosis;
- do not log or persist email addresses, account identifiers, Script IDs, deployment IDs, private URLs, credentials, tokens, or raw exception payloads;
- do not weaken first-owner identity verification;
- do not persist installer ownership/status before identity is verified merely to make the failure visible;
- blank/ambiguous identities must continue to fail closed with zero setup/resource mutation;
- do not add broad diagnostic/public wrappers.

Prefer a safe error-code log/return path over a new persistent storage mechanism.

### A3 Regression coverage

Add focused deterministic coverage proving at minimum:

1. the generated/distribution manifest includes the required `userinfo.email` identity scope;
2. blank active identity still fails before mutation;
3. active/effective mismatch still fails before mutation;
4. authorized identity still reaches normal installer setup path;
5. any observability addition contains no user/account identifier.

Follow `tests/AGENTS.md`; do not create test-only production business behavior.

## Phase B — deterministic validation

Run smallest relevant tests first.

If focused repair tests pass, run:

```text
npm run check
git diff --check
```

Regenerate deterministic bundle/manifest/release artifacts through the repository-supported path and verify source/bundle/public-surface parity required by Work 0023/PR #51.

Do not reopen unrelated accepted tests or product design.

If deterministic validation fails, repair only the direct bounded regression caused by this change. If a broader contradiction appears, STOP and return to ChatGPT.

## Phase C — existing target source update

Only after Phase B PASS:

- positively identify the exact CODEX-17 fresh bound target privately;
- confirm no second target/deployment exists;
- install/sync the repaired exact generated source/manifest into that same bound Apps Script project exactly once;
- verify remote saved source/manifest identity against the repaired repository artifacts;
- AI sync remains disabled;
- no provider credentials are added.

Additional target creations: 0.

If source identity does not match exactly, STOP before installer execution.

## Phase D — repaired installer runtime

### D1 Authorization / consent

The new identity scope may require a fresh Google OAuth consent step.

If native consent is required, do not work around it. Return under the same Dispatch:

```text
WORK_ID: 0028
DISPATCH_ID: 0028-CODEX-18
BALL: USER
STATUS: ACTION_REQUIRED
```

Give only concise UI steps. Do not request private IDs, URLs, emails, credentials, or tokens in chat.

After user consent, resume this same Dispatch ID.

### D2 Repaired I1

Run `installKnowledgeShare()` once on the same target.

PASS requires direct target-runtime evidence of `READY_FOR_DEPLOYMENT`, including:

- installer identity authorization accepted;
- installation status sheet exists;
- accepted installer resources exist inside the isolated target boundary;
- 5 backend sheets only;
- schema 7;
- AI sync disabled;
- no unexpected recurring trigger;
- safe observed installer state is consistent with success.

If D2 still produces no installation outputs, or returns any different runtime failure, STOP. Do not perform another source repair or installer retry in this Dispatch.

### D3 Idempotency

Only after D2 PASS, execute one additional `installKnowledgeShare()` call to prove idempotency.

Require no duplicate folders/resources/sheets/seeds/triggers and same authoritative installation state.

This is the idempotency check, not another repair attempt.

## Phase E — one owner-only WEB_APP and R1-R8

After installer qualification PASS, continue the accepted CODEX-16/17 provider-independent runtime contract on the same target.

Create at most one qualification WEB_APP:

- execute as deploying user / owner;
- access owner-only / `MYSELF` equivalent;
- positively read back `WEB_APP` entrypoint and `/exec` identity before use;
- run `confirmKnowledgeShareDeploymentSecurity()` and `checkKnowledgeShareReadiness()`;
- require `READY`;
- follow `docs/operations/apps-script-web-app-deployment.md`.

Then execute one bounded R1-R8 pass:

### R1
schema7 / 5-sheet backend / append columns / installer idempotency / AI sync disabled.

### R2
Through actual `/exec`, create one synthetic GP Meeting and one synthetic non-GP Meeting; require parent-first stable Meeting identity.

### R3
Attach one tiny supported synthetic file to the non-GP Meeting; verify stable Document_ID and authoritative parent metadata.

### R4
Add one follow-up tiny file to the existing Meeting; Meeting_ID unchanged, new Document_ID only.

### R5
Visible file delete = unlink only; physical file remains; then relink same Document_ID and restore relation.

### R6
Capture authoritative Meeting Google Docs body before unlink, after unlink, after relink; require exact body equality and unchanged unrelated Date/Time/business fields.

### R7
Run dedicated `全文出力` with no AI model/question/provider credential; require Meeting-only authoritative Docs body/business attributes and one bounded no-result/invalid-date safe error.

### R8
AI sync disabled; Gemini hidden/unavailable by default; no Direct OpenAI/Gemini/Azure credentials/calls/resources; no unexpected trigger; owner-only access; confidential writes 0.

Use synthetic/non-confidential data only. Physical delete remains unauthorized.

## Mutation / retry budget for CODEX-18

Cumulative prior evidence is retained. New CODEX-18 mutations are bounded to:

```text
new qualification target: 0
existing target source/manifest update after validated repair: max 1
repaired installer I1: max 1
installer idempotency I2 after I1 PASS: max 1
qualification WEB_APP creation after installer PASS: max 1
WEB_APP replacement/second deployment: 0
R1-R8 business-flow campaign: one bounded pass
provider calls: 0
historical standalone version75 mutation: 0
```

A Google consent interaction does not authorize additional code/deployment retries.

## Provider / Azure boundary

```text
Direct OpenAI calls: 0
Gemini calls: 0
Azure OpenAI calls: 0
AI sync: disabled
provider File Search/citation runtime: OUT_OF_SCOPE
WORK_0030: DEFERRED_BY_USER
```

Do not prepare or activate Work 0030 after Work 0028 success.

## Required report

Create/update on PR #51 branch:

`docs/handoffs/0028-CODEX-18-installer-identity-scope-repair-report.md`

Report at minimum:

```text
WORK_ID: 0028
DISPATCH_ID: 0028-CODEX-18
ACTIVE_HYPOTHESIS_RESULT
ROOT_CAUSE: CONFIRMED | NOT_CONFIRMED
SOURCE_CHANGE_SUMMARY
MANIFEST_SCOPE_VALIDATION
FOCUSED_VALIDATION
CANONICAL_VALIDATION
BUNDLE_IDENTITY
EXISTING_TARGET_REUSED
REPAIRED_INSTALLER_I1
INSTALLER_IDEMPOTENCY_I2
QUALIFICATION_WEB_APP
TARGET_RUNTIME_R1_R8
PROVIDER_RUNTIME: OUT_OF_SCOPE / CALLS_0
WORK_0030: DEFERRED_BY_USER
SIDE_EFFECT_STATE
RESIDUAL_SYNTHETIC_RESOURCES
BLOCKER
READY
```

Do not record private IDs/URLs/accounts/emails/credentials.

## Completion gate

Return after one of:

1. repaired installer + idempotency + owner-only WEB_APP + R1-R8 all PASS;
2. the active hypothesis is rejected by direct evidence and the first repaired I1 still fails;
3. another material application/runtime blocker appears;
4. one native OAuth/user UI interaction is required.

Do not merge PR #51. Do not start Work 0030.

Final response MUST begin and end with:

```text
WORK_ID: 0028
DISPATCH_ID: 0028-CODEX-18
BALL: CHATGPT
STATUS: RETURNED
```

If native user action is genuinely required, use:

```text
WORK_ID: 0028
DISPATCH_ID: 0028-CODEX-18
BALL: USER
STATUS: ACTION_REQUIRED
```
