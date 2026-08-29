# Work 0020 — AI Provider Core

WORK_ID: `0020`
DISPATCH_ID: `0020-CODEX-16`
BALL: `USER`
STATUS: `ACTION_REQUIRED`
MODE: `QUALIFICATION`

Primary plan:
`docs/planning/work0020-personal-pc-gemini-core-qualification.md`

Active instruction:
`docs/handoffs/0020-CODEX-16-direct-provider-control-qualification-instruction.md`

## Primary outcome

Deliver and qualify one provider-neutral Knowledge Search core with exactly three user-facing routes:

```text
ChatGPT
Gemini
全文出力
```

The Gemini route must use the user-approved stable `gemini-3.7-flash`, provide authoritative citations from Meeting and Pitchbook sources, and behave as a practically usable work tool. OpenAI remains deliberately disabled/uncalled. FULL_OUTPUT remains accepted and must not be rerun.

## Accepted evidence — closed

- schema `6`; exactly five Backend sheets;
- FULL_OUTPUT runtime/canonical parity PASS;
- OpenAI disabled and uncalled; no automatic provider failover;
- one existing Gemini File Search Store and accepted document upload/reconciliation behavior;
- both previously uncertain Meeting documents reconciled without duplicate upload/delete;
- one grounded Meeting query completed with three authoritative citations;
- one synthetic TXT Pitchbook remains indexed;
- CODEX-14 request profile PASS: `gemini-3.7-flash`, `background=true`, `thinking_level=low`, `max_output_tokens=2048`;
- CODEX-14 short START/POLL lifecycle, opaque server-owned token, duplicate prevention, reload resume, adaptive polling, and no-false-timeout UX PASS;
- CODEX-14 Interactions + File Search remained provider-pending for at least `600000ms`;
- CODEX-15 Generate Content adapter deterministic validation PASS and one target-runtime query returned a safe service-unavailable category after `83364ms` with zero citations;
- CODEX-15 local/repository checks: focused `109/109`, repository `307/307`; GitHub-hosted CI did not run;
- no dependent metadata/lifecycle mutation was performed after the provider failure.

## Current blocker

Both supported application paths failed to produce a grounded Pitchbook result in the current DEV project:

```text
Interactions + File Search
-> still pending after >=600000ms

Generate Content + File Search
-> safe service-unavailable result after 83364ms
-> zero citations
```

This strongly shifts suspicion away from the repaired browser/Apps Script state machine, but it does not yet prove a Google provider incident because:

- no direct no-File-Search base-model control was run;
- no direct same-project SDK control was run outside Apps Script;
- CODEX-15 did not safely identify an HTTP status or transport exception class;
- the existing Store and `gemini-embedding-2` path were not isolated from general File Search and metadata-filter behavior.

## Important unqualified source state

The pushed source and deployed version `54` currently set the normal Gemini query transport to `GENERATE_CONTENT`, even though CODEX-15 explicitly did not accept that transport.

Therefore:

- the current private DEV Gemini route is not user-ready;
- PR `#26` must remain Draft / Open / unmerged;
- no Work completion or transport selection is claimed;
- a later authorized dispatch must correct the default before merge, based on direct evidence.

## Strategy Reset — CODEX-16

CODEX-16 performs direct provider controls outside Apps Script using the same Google project credential. It distinguishes:

```text
base Gemini model/key/project
File Search generally
existing Store
metadata filtering
gemini-embedding-2 path
Apps Script / UrlFetchApp integration
```

It may create only temporary synthetic Stores under the exact handoff matrix and must delete them. It must not modify the application source, current Store, deployment, or real data.

## User prerequisite

A same-project Gemini API key must be available only in the local Codex process as:

```text
GEMINI_API_KEY
```

The key must never be pasted into ChatGPT, a Codex prompt, GitHub, report, screenshot, repository `.env`, or logs. If the original key is no longer locally available, create a temporary key in the same Google Cloud project, set it locally, and revoke it after qualification if desired.

Until the local secret prerequisite is satisfied:

```text
BALL: USER
STATUS: ACTION_REQUIRED
```

After it is satisfied, execute the same `0020-CODEX-16` dispatch; do not allocate a new Dispatch ID merely for resumption.

## CODEX-16 completion boundary

CODEX-16 returns one of:

```text
GEMINI_PROJECT_KEY_OR_BASE_MODEL_PATH
GEMINI_FILE_SEARCH_GENERAL_OR_PROJECT_PATH
GEMINI_FILE_SEARCH_METADATA_FILTER_PATH
GEMINI_FILE_SEARCH_EMBEDDING_2_PATH
EXISTING_FILE_SEARCH_STORE_PATH
APPS_SCRIPT_URLFETCH_INTEGRATION_PATH
```

and the cheapest decisive next action.

CODEX-16 does not repair or deploy the application. A subsequent dispatch may implement only the evidence-selected fix, restore a safe transport/default, complete the Pitchbook citation and lifecycle gates, integrate current main, and finish PR `#26`.

## Current Work classification

```text
SELECTED_GEMINI_QUERY_TRANSPORT: NONE QUALIFIED
PITCHBOOK_AUTHORITATIVE_CITATIONS: 0
METADATA_FILTER: NOT RUN
LIFECYCLE: NOT RUN
LOGIC_VALIDATION: PASS — CODEX-15 local/repository evidence
SCHEMA_ALIGNMENT: PASS
OPENAI_RUNTIME: SAFE_DISABLED_ERROR — deliberately deferred
GEMINI_DOCUMENT_RECONCILIATION: PASS
GEMINI_RUNTIME: BLOCKED / DIRECT PROVIDER ISOLATION REQUIRED
FULL_OUTPUT_RUNTIME: PASS — accepted prior evidence
STATE_INTEGRITY: PARTIAL
FINAL_INTEGRITY: NOT RUN
READY: NO
BLOCKER: YES
```

## Boundaries

- no model downgrade or unpinned alias;
- no blind retry through either Web App path;
- no existing Store mutation or reindex;
- no real Meeting/Pitchbook data in the direct controls;
- no OpenAI call or FULL_OUTPUT rerun;
- no new Google project or paid Priority tier;
- no application source/deployment change in CODEX-16;
- no PR merge or current-main integration until the runtime blocker closes.

WORK_ID: `0020`
DISPATCH_ID: `0020-CODEX-16`
BALL: `USER`
STATUS: `ACTION_REQUIRED`
