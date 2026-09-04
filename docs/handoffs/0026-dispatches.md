# Work 0026 dispatch control

WORK_ID: `0026`
ACTIVE_DISPATCH_ID: `0026-CODEX-02`
BALL: `CHATGPT`
STATUS: `RETURNED`

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

## Final dispatch

### 0026-CODEX-02 — RETURNED / repaired runtime; Gemini disabled on external limitation

CODEX-02 independently revalidated the modular-template repair, delivered and read back all `82` deployable files once, created immutable version `69`, and updated the same private Web App once. Normal and cache-bypassed root/Knowledge Search loads expanded every include, completed bootstrap, and had zero blocking console errors.

The bounded Gemini campaign then completed as follows:

```text
GEMINI_KEY_AND_STORE: accessible / secret-safe
DOC-000017_EXACT_SYNC: PASS / selected 1 / indexed 1 / failed 0
MTG-000005_EXACT_SYNC: PASS / selected 1 / indexed 1 / failed 0
PRIMARY_TUPLE: gemini-3.8-flash / low / 2048
DIRECT_INTERACTIONS_CONTROL: FAIL / safe final response after approximately 79 seconds
EXPLICIT_MODEL_ACCESS_OR_UNSUPPORTED: NO
GEMINI_3_7_FALLBACK: NOT_USED
NORMAL_PRODUCT_QUERY_CAMPAIGN: NOT_RUN / exact tuple stop gate
GEMINI_FINAL_STATE: DISABLED_EXTERNAL_LIMITATION / hidden from normal users
OPENAI_API_CALLED: NO
```

The synchronous qualification did not produce the required grounded answer and authoritative citation. With no explicit access/unsupported evidence, the only authorized fallback condition was not met. No broad sync, alternate Store, extra deployment, provider fallback, live FULL_OUTPUT call or OpenAI call occurred.

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
CURRENT_PRIVATE_WEB_APP_VERSION: 69 / shell PASS
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

The Work terminal provider state is:

```text
DISABLED_EXTERNAL_LIMITATION
```

The Web App shell and exact source reconciliation passed before the current Interactions/File Search qualification failed. Gemini remains disabled/hidden, so this is the accepted fail-closed terminal state rather than a claim that Gemini works.

CODEX-02 is returned. Any later provider requalification requires a new instruction and Dispatch ID; do not resume this bounded campaign implicitly.

WORK_ID: `0026`
ACTIVE_DISPATCH_ID: `0026-CODEX-02`
BALL: `CHATGPT`
STATUS: `RETURNED`
