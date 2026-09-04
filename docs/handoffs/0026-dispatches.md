# Work 0026 dispatch control

WORK_ID: `0026`
ACTIVE_DISPATCH_ID: `0026-CODEX-02`
BALL: `CODEX`
STATUS: `READY`

## Dispatch history

### 0026-CODEX-01 — RETURNED / product blocker before provider qualification

CODEX-01 implemented the current Gemini API/model-policy path and passed deterministic validation, then consumed its one-version/one-Web-App-update budget deploying version 68. The target runtime rendered modular HTML include directives literally, so the Web App shell could not load its included styles/client/admin resources. Gemini and OpenAI were not called.

The smallest repair is already committed and tested:

`681768824f298eff24439b2ee69c9ce159af1e0e — fix: preserve modular HTML template evaluation`

```text
VERSION_68: deployed / blocked
VERSION_67: unused / never deploy
LOGIC_VALIDATION: PASS / 410 of 410
GEMINI_API_CALLED: NO
OPENAI_API_CALLED: NO
BLOCKER: FULL_WEB_APP_MODULAR_TEMPLATE_INCLUDE_RUNTIME_REGRESSION
```

CODEX-01 report:

`docs/handoffs/0026-CODEX-01-current-gemini-flash-file-search-requalification-report.md`

## Active dispatch

### 0026-CODEX-02 — READY / repaired runtime deployment then bounded Gemini qualification

Primary sequence:

1. independently verify the tested modular-template repair and all deterministic gates;
2. deliver/read back repaired source once;
3. create exactly one new immutable version, expected `69`;
4. update the same private Web App exactly once;
5. prove root and Knowledge Search pages expand all server-side includes and complete normal bootstrap;
6. only after shell PASS, inventory the existing Gemini key/Store/source state safely;
7. reconcile only `DOC-000017` and `MTG-000005` if needed;
8. qualify `gemini-3.8-flash / low / 2048`, with `gemini-3.7-flash / low / 2048` allowed only after explicit model-access/model-unsupported evidence;
9. prove normal-product Pitchbook and Meeting grounded citations, exact metadata filtering and responsive START/POLL lifecycle;
10. terminate as `QUALIFIED`, `DISABLED_EXTERNAL_LIMITATION`, or a new product blocker.

Detailed instruction:

`docs/handoffs/0026-CODEX-02-runtime-template-repair-and-gemini-qualification-instruction.md`

Planning source:

`docs/planning/work0026-gemini-current-api-requalification.md`

## Accepted baseline

```text
WORK_0020: ACCEPTED
WORK_0025: ACCEPTED
WORK_0021: ACCEPTED / prior accepted private Web App version 66
WORK_0023: ACCEPTED / merge 8b0a2ccd
CURRENT_PRIVATE_WEB_APP_VERSION: 68 / blocked shell
VERSION_67: unused / never deploy
OPENAI/FULL_OUTPUT: accepted production reference
BUNDLE/INSTALLER: accepted
```

## Scope discipline

Use exact pinned candidate IDs only. Preferred candidate is `gemini-3.8-flash` with explicit `low` thinking and output ceiling 2048. `gemini-3.7-flash` is the only allowed access-error fallback candidate.

Do not perform broad sync/reindex, large-file work, company rollout, historical migration, Store sharding, chunking/embedding benchmarks, provider/model sweeps, OpenAI runtime calls, FULL_OUTPUT runtime reruns, CI implementation, or general hardening.

Runtime mutation budget for CODEX-02:

```text
APPS_SCRIPT_SOURCE_DELIVERY: max 1
NEW_IMMUTABLE_VERSION: max 1 / expected 69
SAME_PRIVATE_WEB_APP_UPDATE: max 1
VERSION_67_DEPLOYMENT: prohibited
VERSION_70_OR_HIGHER: prohibited
OPENAI_API_CALLED: NO
```

If shell rendering is still broken after the single repaired update, stop before Gemini and return the new exact product blocker.

The Work terminal provider states remain:

```text
QUALIFIED
DISABLED_EXTERNAL_LIMITATION
```

`DISABLED_EXTERNAL_LIMITATION` is valid only after the Web App shell works, deterministic current-code contracts pass, no application/source-integrity defect explains the failure, and bounded provider evidence identifies the external limitation while Gemini remains disabled/hidden.

A native user credential/action inside the still-running CODEX-02 keeps the same Dispatch ID and hands the ball to USER. Any new Codex execution after RETURNED must use the next Dispatch ID.

WORK_ID: `0026`
ACTIVE_DISPATCH_ID: `0026-CODEX-02`
BALL: `CODEX`
STATUS: `READY`
