# Work 0020 report

WORK_ID: `0020`
ACTIVE_DISPATCH_ID: `0020-CODEX-15`
BALL: `CODEX`
DISPATCH_STATUS: `RETURNED`
WORK_READY: `NO`
BLOCKER: `YES`

## Current Classification

```text
GEMINI_MODEL: gemini-3.7-flash
GEMINI_REQUEST_PROFILE: PASS
GEMINI_BACKGROUND_LIFECYCLE: PASS
GEMINI_USER_EXPERIENCE: PASS — application-side pending UX
PITCHBOOK_AUTHORITATIVE_CITATIONS: 0
LOGIC_VALIDATION: PASS — CODEX-14 local/repository evidence
SCHEMA_ALIGNMENT: PASS
OPENAI_RUNTIME: SAFE_DISABLED_ERROR — deliberately deferred/disabled; uncalled
GEMINI_DOCUMENT_RECONCILIATION: PASS
GEMINI_RUNTIME: BLOCKED / GEMINI_FILE_SEARCH_PROVIDER_PATH
FULL_OUTPUT_RUNTIME: PASS — accepted prior evidence; not rerun
STATE_INTEGRITY: PASS — pending query caused no unintended mutation
FINAL_INTEGRITY: PARTIAL — metadata/lifecycle gates not run
READY: NO
BLOCKER: YES
```

## CODEX-15 Return — Generate Content provider-path isolation

CODEX-15 performed the one authorized read-only POLL of the CODEX-14 opaque
job. The token was expired after the accepted long-running observation, so no
new Interaction was created and no raw provider identity was recovered.

The corrected Generate Content + File Search adapter passed deterministic
validation and was delivered as source-equivalent version `54` to the same
private Web App. One synthetic Pitchbook query was submitted through the
normal UI. After `83364ms` the Web App returned only the safe application
category `Gemini search service unavailable`, with no answer and zero
authoritative citations. The query was not retried.

Therefore the dependent metadata-filter, update/reindex, Inactive, Reactivate,
delete/rebuild, and Work-level final-integrity gates were not run. No source,
Store, or deployment expansion was made by those gates.

```text
GENERATE_CONTENT_FILE_SEARCH: FAIL
PITCHBOOK_AUTHORITATIVE_CITATIONS: 0
GEMINI_RUNTIME: BLOCKED / GEMINI_FILE_SEARCH_PROVIDER_PATH
LOGIC_VALIDATION: PASS — 109 focused AI tests; 307/307 repository check
FULL_OUTPUT_RUNTIME: PASS — accepted prior evidence; not rerun
FINAL_INTEGRITY: NOT RUN — blocked before dependent gates
READY: NO
BLOCKER: YES
```

Detailed report:
`docs/handoffs/0020-CODEX-15-gemini-provider-path-isolation-and-final-qualification-report.md`

## ChatGPT GitHub Review of CODEX-14

GitHub source of truth confirms:

- branch `agent/0020-ai-provider-core`;
- Draft PR `#26` remains Open / unmerged / mergeable;
- implementation commit `f63cb59d990a1392dfbd7be6efbb6bcbe63fb5c5`;
- qualification/report commit `3935ab7c5eea4e1fe3a18574625fec4522c70e25`;
- final returned branch head `bc8a0e8e801b4afeb828cc6a1e18087435764535`;
- final head after CODEX-14 is three commits ahead of the prepared CODEX-14 ref and changes the expected Gemini request, transport, provider-core, browser UX, tests, and tracking files;
- exact tested source readback `78/78`, immutable Apps Script version `53`, and same owner-only private Web App update are recorded;
- GitHub Actions workflow runs and commit status checks are both `0`, so `301/301 PASS` is local/repository evidence, not GitHub-hosted CI evidence.

Detailed report:
`docs/handoffs/0020-CODEX-14-gemini-query-performance-and-ux-optimization-report.md`

## What CODEX-14 Successfully Delivered

The actual source implements the intended application-side architecture:

- request profile includes `background=true`, `thinking_level=low`, and `max_output_tokens=2048`;
- START performs one provider POST and returns pending without a sleep/poll loop;
- each POLL performs at most one provider GET;
- documented pending and terminal status classes are normalized;
- provider Interaction identity remains server-side behind an opaque token;
- duplicate pending START and terminal delivery are idempotent by contract;
- browser feedback is immediate, prior result is preserved, polling backs off, page reload resumes the same token, and the UI does not falsely report timeout while the provider remains pending;
- safe numeric telemetry hooks exist without retaining question/source text or exposing raw provider identity.

Target-runtime evidence also confirms:

- one synthetic Pitchbook START only;
- reload and manual recheck reused the same opaque job;
- START returned to pending in approximately `9115ms`;
- maximum observed POLL round trip was approximately `9691ms`;
- the same provider Interaction remained nonterminal after at least `600000ms`;
- no second START, terminal failure Audit, lifecycle mutation, Store/deployment/Library expansion, OpenAI call, or FULL_OUTPUT rerun occurred.

CODEX-14 is therefore accepted for request-shape, application-lifecycle, duplicate-prevention, and pending-state UX work.

## What CODEX-14 Did Not Prove

The Work outcome is not complete:

- the indexed synthetic Pitchbook produced no authoritative citation;
- the provider did not reach a documented terminal state within the bounded ten-minute observation;
- no safe usage metrics were available because the provider never completed;
- exact metadata filtering and update / Inactive / Reactivate / delete-rebuild gates were not run;
- practical end-user query latency was not achieved.

A small already-indexed TXT source with a narrow filter remaining pending for more than ten minutes is not acceptable as a normal interactive search path. It is also no longer attributable to the former Apps Script same-call polling defect, because that defect has been repaired and directly qualified.

Current official Gemini documentation describes File Search as a fast retrieval layer and shows `gemini-3.7-flash` queries through the Interactions API. It also separately supports File Search through the Generate Content API, including metadata filters and grounding metadata/custom metadata for citations. This provides one bounded, officially supported comparison path without changing model, corpus, or indexing architecture.

## Review Corrections

### Commit identity

The CODEX-14 report currently records an earlier report commit as `FINAL_COMMIT`. Use:

```text
IMPLEMENTATION_COMMIT: f63cb59d990a1392dfbd7be6efbb6bcbe63fb5c5
QUALIFICATION_REPORT_COMMIT: 3935ab7c5eea4e1fe3a18574625fec4522c70e25
FINAL_BRANCH_HEAD: bc8a0e8e801b4afeb828cc6a1e18087435764535
```

### Integrity terminology

`FINAL_INTEGRITY: PASS` in the returned summary only establishes that the pending query caused no unintended current-state mutation. Because the lifecycle completion gates were not run, Work-level classification is:

```text
STATE_INTEGRITY: PASS
FINAL_INTEGRITY: PARTIAL
```

### CODEX-13 history

The user supplied late evidence that CODEX-13 executed locally and returned `PROVIDER_LONG_RUNNING`, with local commit `429ed454d59e01353a68d42e4322fc5fe13787f1`. GitHub does not contain that commit, so the exact local diff cannot be independently accepted as GitHub source. Record CODEX-13 as `EXECUTED LOCALLY / RETURNED / SUPERSEDED BY CODEX-14`, not `NOT EXECUTED`.

## Findings

### BLOCKER

1. The normal Gemini query has not completed with an authoritative Pitchbook citation.
2. Interactions + File Search remained provider-pending for more than ten minutes even after low thinking, bounded output, correct background execution, and correct cross-request polling.
3. Metadata-filter and source lifecycle gates remain dependent on a fast grounded query.
4. Work-level final integrity remains partial until those lifecycle gates finish.

### FIX SOON / FOLLOW_UP

1. Pending query state is stored in Apps Script `CacheService`. Google documents that cache entries may disappear before their requested expiry. One reload-resume smoke passed, but this is not durable state. If Interactions remains the normal transport, durable server-side pending-state persistence is a completion blocker; if it becomes an inactive rollback path, record it as follow-up.
2. START and POLL calls each took roughly nine to ten seconds. This is acceptable for the diagnostic state machine but still merits later application-overhead profiling after the provider path is selected.
3. GitHub-hosted CI/check evidence is absent.
4. The Work branch is `13` commits behind current `main`; integrate main only after the provider blocker closes and before final merge.
5. A representative Meeting/Pitchbook latency benchmark and user-selectable thinking level belong to later Works after Work 0020 closes.

### BACKLOG / OPTIONAL

- Store partitioning, chunking changes, reindexing, duplicate summary layers, and paid Priority inference are not justified by current evidence.

## Strategy Reset — CODEX-15

One active hypothesis:

> The remaining pathological delay is specific to the current Gemini Interactions + File Search execution path. The officially supported Generate Content + File Search path, using the same model, Store, exact synthetic document metadata, low thinking, and output cap, will either complete within an interactive bound with authoritative grounding or prove that the blocker lies in Gemini File Search/project/provider behavior more generally.

Active instruction:
`docs/handoffs/0020-CODEX-15-gemini-provider-path-isolation-and-final-qualification-instruction.md`

Decisive sequence:

```text
one read-only POLL of existing CODEX-14 job
-> if grounded completed: finish lifecycle with Interactions
-> otherwise one deterministic Generate Content adapter
-> one exact live Generate Content + File Search synthetic query
-> if <=90000ms and authoritative citation: select it and finish lifecycle
-> otherwise STOP as GEMINI_FILE_SEARCH_PROVIDER_PATH blocker
```

No blind retry or second retrieval architecture is authorized.

## Accepted Evidence Preserved

- CODEX-03 through CODEX-11 schema/FULL_OUTPUT/provider/upload/reconciliation/Meeting-query evidence remains closed.
- CODEX-12 failure-mode evidence remains accepted.
- CODEX-14 request profile, application lifecycle, dedupe, pending UX, and state-integrity evidence is accepted.
- Synthetic Pitchbook indexing remains accepted and must not be repeated merely for diagnosis.

## Target Final Matrix

```text
SELECTED_GEMINI_QUERY_TRANSPORT: INTERACTIONS | GENERATE_CONTENT
GEMINI_QUERY_LATENCY_MS: <= 90000 for isolated one-document qualification
PITCHBOOK_AUTHORITATIVE_CITATIONS: >= 1
METADATA_FILTER: PASS
LIFECYCLE: PASS
LOGIC_VALIDATION: PASS
SCHEMA_ALIGNMENT: PASS
OPENAI_RUNTIME: SAFE_DISABLED_ERROR — deliberately deferred
GEMINI_DOCUMENT_RECONCILIATION: PASS
GEMINI_RUNTIME: PASS
FULL_OUTPUT_RUNTIME: PASS
FINAL_INTEGRITY: PASS
READY: YES
BLOCKER: NO
```

WORK_ID: `0020`
ACTIVE_DISPATCH_ID: `0020-CODEX-15`
BALL: `CODEX`
DISPATCH_STATUS: `READY`
WORK_READY: `NO`
BLOCKER: `YES`
