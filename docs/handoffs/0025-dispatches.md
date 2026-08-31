# Work 0025 dispatch control

WORK_ID: `0025`
ACTIVE_DISPATCH_ID: `NONE`
BALL: `NONE`
STATUS: `ACCEPTED`

## Accepted dispatches

### 0025-CODEX-02 — ACCEPTED / EXACT THINKING QUALIFICATION

Accepted evidence:

- per-thinking `QUALIFIED / UNQUALIFIED / FAILED` state;
- exact provider + model + thinking omission/raw value + output ceiling + File Search qualification;
- only individually qualified thinking choices exposed to normal users;
- server-side rejection of stale, disabled, unqualified and failed thinking choices;
- one temporary synthetic source per bounded administrator qualification action with cleanup;
- focused 101/101 and canonical 345/345 PASS;
- exact 79/79 Apps Script source readback;
- same private Web App updated once to version 60;
- current `gpt-5.6-terra` + provider-default tuple qualification PASS;
- designated `DOC-000017` and `MTG-000005` grounded query/citation PASS;
- no Gemini, source sync/lifecycle, FULL_OUTPUT runtime call, or large-fixture mutation.

Report:

`docs/handoffs/0025-CODEX-02-thinking-profile-qualification-gate-report.md`

### 0025-CODEX-01 — ACCEPTED / MODEL POLICY VERTICAL SLICE

Accepted foundation:

- Settings-backed model-policy registry;
- administrator model/thinking controls;
- normal-user selectors;
- raw model/thinking rejection;
- current default migration and historical model registration;
- no automatic latest-model activation;
- no stronger/more-expensive or cross-provider fallback;
- OpenAI search/citation non-regression.

CODEX-02 superseded only CODEX-01's model-only qualification scope.

Report:

`docs/handoffs/0025-CODEX-01-model-policy-foundation-and-user-selection-report.md`

## GitHub delivery

- Draft PR #32 was closed unmerged only because the connected ready-for-review mutation failed before changing GitHub state.
- The exact same branch head was recreated as non-draft PR #33 without implementation changes.
- PR #33 merged to `main` at merge commit `121f2a1c4655ece46c7e07163b0d12866600923e`.
- GitHub CI/status checks did not run.

## Final classification

```text
MODEL_POLICY_REGISTRY: PASS
ADMIN_MODEL/THINKING_CONTROL: PASS
USER_MODEL/THINKING_SELECTOR: PASS
RAW_MODEL/THINKING_BYPASS: BLOCKED
CURRENT_DEFAULT_OPENAI_PATH: PASS
THINKING_PROFILE_QUALIFICATION: PASS
TARGET_RUNTIME: same private Web App version 60
PR_33: MERGED
GITHUB_CI_ACTUALLY_RAN: NO
BLOCKER: NONE
```

WORK_ID: `0025`
ACTIVE_DISPATCH_ID: `NONE`
BALL: `NONE`
STATUS: `ACCEPTED`
