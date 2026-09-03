# Work 0026 dispatch control

WORK_ID: `0026`
ACTIVE_DISPATCH_ID: `0026-CODEX-01`
BALL: `CHATGPT`
STATUS: `RETURNED`

## Active dispatch

### 0026-CODEX-01 — RETURNED / blocked before provider qualification

Primary outcome:

- compare the existing Gemini implementation with the current official model/File Search APIs;
- integrate Gemini with the accepted administrator model/thinking policy and exact tuple qualification;
- preserve responsive START/POLL behavior and authoritative citation requirements;
- run one bounded current provider campaign using the small accepted synthetic Pitchbook and Meeting sources;
- either qualify one exact Gemini Flash tuple or leave Gemini safely disabled with a precise current external limitation.

Detailed instruction:

`docs/handoffs/0026-CODEX-01-current-gemini-flash-file-search-requalification-instruction.md`

Planning source:

`docs/planning/work0026-gemini-current-api-requalification.md`

## Accepted baseline

```text
WORK_0020: ACCEPTED
WORK_0025: ACCEPTED
WORK_0021: ACCEPTED / private Web App version 66
WORK_0023: ACCEPTED / merge 8b0a2ccd
VERSION_67: unused / never deploy
OPENAI/FULL_OUTPUT: accepted production reference
BUNDLE/INSTALLER: accepted
```

## Scope discipline

Use exact pinned candidate IDs only. Preferred candidate is `gemini-3.8-flash` with explicit `low` thinking and 2048 output; `gemini-3.7-flash` is the only allowed access-error fallback candidate.

Do not perform broad sync/reindex, large-file work, company rollout, historical migration, Store sharding, chunking/embedding benchmarks, provider/model sweeps, OpenAI runtime calls, FULL_OUTPUT runtime reruns, CI implementation, or general hardening.

The bounded runtime campaign stopped before a provider call because version 68 exposed a modular Web App template-include regression. The source repair and deterministic regression test pass, but the one-version/one-deployment budget was exhausted. Gemini was not called or qualified.

```text
RUNTIME_DEPLOYMENT_VERSION: 68
LOGIC_VALIDATION: PASS / 410 of 410
TARGET_RUNTIME_QUALIFICATION: FAIL / Web App shell regression
GEMINI_API_CALLED: NO
OPENAI_API_CALLED: NO
BLOCKER: FULL_WEB_APP_MODULAR_TEMPLATE_INCLUDE_RUNTIME_REGRESSION
NEXT_ACTION: new ChatGPT-issued Dispatch for one repaired deployment, then resume bounded Gemini campaign
```

The intended Work terminal states remain:

```text
QUALIFIED
DISABLED_EXTERNAL_LIMITATION
```

The second outcome is acceptable only when current-code deterministic safety gates pass and Gemini remains disabled/hidden with an exact external/provider diagnosis.

A native user action inside the still-running CODEX-01 keeps the same Dispatch ID and hands the ball to USER. Any new Codex execution after RETURNED must use the next Dispatch ID.

WORK_ID: `0026`
ACTIVE_DISPATCH_ID: `0026-CODEX-01`
BALL: `CHATGPT`
STATUS: `RETURNED`
