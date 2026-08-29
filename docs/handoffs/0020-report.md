# Work 0020 report

WORK_ID: `0020`
ACTIVE_DISPATCH_ID: `0020-CODEX-16`
BALL: `USER`
DISPATCH_STATUS: `ACTION_REQUIRED`
WORK_READY: `NO`
BLOCKER: `YES`

## Current classification

```text
GEMINI_MODEL: gemini-3.7-flash
GEMINI_REQUEST_PROFILE: PASS
GEMINI_BACKGROUND_LIFECYCLE: PASS
GEMINI_USER_EXPERIENCE: PASS — pending-state application UX
INTERACTIONS_FILE_SEARCH: PROVIDER_LONG_RUNNING — >=600000ms
GENERATE_CONTENT_FILE_SEARCH: FAIL — 83364ms, safe service-unavailable category
TEXT_ONLY_BASE_MODEL_CONTROL: NOT RUN
DIRECT_PROVIDER_CONTROL: NOT RUN
SELECTED_GEMINI_QUERY_TRANSPORT: NONE QUALIFIED
PITCHBOOK_AUTHORITATIVE_CITATIONS: 0
METADATA_FILTER: NOT RUN
LIFECYCLE: NOT RUN
LOGIC_VALIDATION: PASS — focused 109/109 and repository 307/307, local/repository evidence
SCHEMA_ALIGNMENT: PASS
OPENAI_RUNTIME: SAFE_DISABLED_ERROR — deliberately deferred/disabled; uncalled
GEMINI_DOCUMENT_RECONCILIATION: PASS
GEMINI_RUNTIME: BLOCKED / DIRECT PROVIDER ISOLATION REQUIRED
FULL_OUTPUT_RUNTIME: PASS — accepted prior evidence; not rerun
STATE_INTEGRITY: PARTIAL — no unintended mutation observed; CODEX-15 final readback not run
FINAL_INTEGRITY: NOT RUN
READY: NO
BLOCKER: YES
```

## ChatGPT GitHub review of CODEX-15

GitHub source of truth confirms:

- branch `agent/0020-ai-provider-core`;
- final returned branch head `54ccb4a2f3d162927ac2a24df46ec829adc62b91`;
- implementation commit `fe1f1c63aad2e84b98a43b7a7d130bff607229d7`;
- qualification/report commit `af71a23f4d4c088d9e56eda2c63ee800a08f682a`;
- PR `#26` remains Draft / Open / unmerged / mergeable;
- CODEX-15 added one Generate Content + File Search adapter, response grounding normalization, safe telemetry hooks, and deterministic tests;
- CODEX-15 delta from its prepared ref contains four commits and changes only its report/tracking files, AI constants/contracts/client/provider core, and direct AI tests;
- Apps Script version `54` was created and the same private Web App was updated in place;
- GitHub Actions workflow runs and commit status checks are both `0`.

The detailed report is:

`docs/handoffs/0020-CODEX-15-gemini-provider-path-isolation-and-final-qualification-report.md`

## What CODEX-15 established

1. The prior CODEX-14 opaque token had expired, so the long-running provider Interaction could no longer be observed through the application token.
2. The official Generate Content + File Search request adapter passed deterministic validation.
3. One target-runtime synthetic Pitchbook query returned the application's safe `Gemini search service unavailable` category after `83364ms`.
4. The query returned no answer and zero authoritative citations.
5. No retry, upload, reindex, lifecycle mutation, Store rebuild, key/model change, OpenAI call, FULL_OUTPUT rerun, or deployment expansion followed.

This is useful evidence because both supported application query paths failed on an already-indexed small synthetic Pitchbook in the same DEV project.

## What CODEX-15 did not establish

The returned public error is deliberately redacted. The report records:

```text
GENERATE_CONTENT_SERVER_MS: NOT_SAFELY_OBSERVABLE
PITCHBOOK_PROVIDER_TERMINAL_STATUS: NOT OBSERVED
```

Therefore `83364ms + service unavailable` does not prove which of the following occurred:

- an HTTP provider error such as a transient service/quota response;
- a project/key entitlement or quota condition;
- transport termination between Apps Script and Gemini;
- malformed or unsupported live request behavior that was hidden by the safe wrapper;
- a broader File Search path failure.

CODEX-15 also did not run:

- a text-only `gemini-3.7-flash` control without File Search;
- a direct same-project SDK call outside Apps Script;
- a fresh text-only File Search Store control;
- an unfiltered-versus-filtered comparison;
- an embedding-model comparison.

A Google provider incident is therefore plausible but not yet proven.

## Blocking source-state inconsistency

CODEX-15 says Generate Content was attempted but not accepted as the normal transport. However, the pushed source and Apps Script version `54` currently set:

```text
QUERY_TRANSPORT = GENERATE_CONTENT
```

This leaves an unqualified failed diagnostic transport selected by default.

Consequences:

- PR `#26` must not be merged;
- version `54` is not user-ready for Gemini search;
- a later evidence-selected implementation dispatch must restore or select a safe transport/default;
- until then, the private DEV Gemini route should not be treated as operational.

## Problem classification

### BLOCKER

1. Neither Interactions nor Generate Content has produced a grounded Pitchbook result in the current DEV path.
2. Pitchbook authoritative citations remain `0`.
3. Metadata-filter and update / Inactive / Reactivate / delete-rebuild gates remain unexecuted.
4. Work-level final integrity is not established.
5. The source currently defaults to a Generate Content transport that CODEX-15 did not accept.
6. Direct provider controls are required before another application fix or provider escalation can be selected responsibly.

### FIX SOON

1. GitHub-hosted CI/check evidence is absent.
2. The Work branch has diverged from newer `main`; integrate current main only after the provider blocker closes and before final merge.
3. CODEX-14's resumable pending state uses best-effort Apps Script cache storage. If Interactions remains active, durable persistence must be addressed.
4. START/POLL application overhead of roughly nine to ten seconds should be profiled after a provider path qualifies.

### BACKLOG

1. User-selectable thinking level (`自動 / 高速 / 標準 / 深掘り`).
2. Representative Meeting/Pitchbook latency benchmarking across document sizes and search modes.
3. Store partitioning, chunking changes, duplicate summary layers, and paid service tiers only if later evidence justifies them.

## Strategy Reset — CODEX-16

The next decisive step is an external control matrix using the same Google project API key through the current official SDK, outside Apps Script.

Active instruction:

`docs/handoffs/0020-CODEX-16-direct-provider-control-qualification-instruction.md`

The controls isolate:

```text
base model/key/project
File Search generally
existing Store
metadata filtering
gemini-embedding-2
Apps Script / UrlFetchApp integration
```

The application source, deployment, current Store, and real data remain unchanged during this qualification.

## User action required

Make a Gemini API key from the same Google Cloud project available only to the local Codex process as `GEMINI_API_KEY`.

Do not paste or reveal the key in ChatGPT, a Codex prompt, GitHub, reports, screenshots, repository files, or logs. A temporary same-project key may be created and revoked after the qualification.

After the secret is available locally, resume the existing `0020-CODEX-16` dispatch. Do not allocate `CODEX-17` merely for the resume.

## Target next evidence

```text
BASE_MODEL_CONTROL: PASS | FAIL
EXISTING_STORE_UNFILTERED_CONTROL: PASS | FAIL | NOT_AVAILABLE
EXISTING_STORE_FILTERED_CONTROL: PASS | FAIL | NOT_AVAILABLE
FRESH_EMBEDDING_001_UNFILTERED_CONTROL: PASS | FAIL
FRESH_EMBEDDING_001_FILTERED_CONTROL: PASS | FAIL | NOT_RUN
FRESH_EMBEDDING_2_FILTERED_CONTROL: PASS | FAIL | NOT_RUN
DIRECT_PROVIDER_CLASSIFICATION: one supported stable enum
TEMP_RESOURCE_CLEANUP: PASS
APPLICATION_SOURCE_CHANGED: NO
```

WORK_ID: `0020`
ACTIVE_DISPATCH_ID: `0020-CODEX-16`
BALL: `USER`
DISPATCH_STATUS: `ACTION_REQUIRED`
WORK_READY: `NO`
BLOCKER: `YES`
