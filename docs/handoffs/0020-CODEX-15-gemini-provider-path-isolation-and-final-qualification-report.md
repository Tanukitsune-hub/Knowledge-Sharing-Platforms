# Work 0020 — CODEX-15 Gemini provider-path isolation and final qualification

WORK_ID: `0020`
DISPATCH_ID: `0020-CODEX-15`
BALL: `CODEX`
STATUS: `RETURNED`

## Outcome

The existing CODEX-14 opaque job was polled once, read-only. Its token had
expired after the already recorded long-running observation, so no new
Interaction was created and no provider identifier was recovered.

The bounded Generate Content + File Search qualification was then attempted
exactly once against the existing synthetic indexed Pitchbook. The Web App
returned a safe service-unavailable result after `83364ms`, with no answer and
no authoritative citation. No query retry, upload, reindex, lifecycle mutation,
Store change, or deployment expansion was performed.

## Qualification record

```text
EXISTING_INTERACTION_DISPOSITION: EXPIRED / NOT OBSERVABLE
EXISTING_INTERACTION_TOTAL_ELAPSED_MS: >=600000 (accepted CODEX-14 observation)
EXISTING_INTERACTION_CANCELLED: NO — token expired; raw provider ID unavailable
GENERATE_CONTENT_FILE_SEARCH: FAIL — safe application result: Gemini search service unavailable
GENERATE_CONTENT_SERVER_MS: NOT_SAFELY_OBSERVABLE — browser total 83364ms
SELECTED_GEMINI_QUERY_TRANSPORT: GENERATE_CONTENT (attempted; not accepted)
PITCHBOOK_AUTHORITATIVE_CITATIONS: 0
METADATA_FILTER: NOT RUN — dependent on grounded query PASS
LIFECYCLE: NOT RUN — dependent on grounded query PASS
LOGIC_VALIDATION: PASS — 109 focused AI tests; 307/307 repository check
GEMINI_DOCUMENT_RECONCILIATION: PASS — accepted prior evidence
GEMINI_RUNTIME: BLOCKED / GEMINI_FILE_SEARCH_PROVIDER_PATH
FULL_OUTPUT_RUNTIME: PASS — accepted prior evidence; not rerun
STATE_INTEGRITY: NO UNEXPECTED APPLICATION-DATA MUTATION OBSERVED — final readback not run
FINAL_INTEGRITY: NOT RUN — CODEX-15 stop condition
READY: NO
BLOCKER: YES
IMPLEMENTATION_COMMIT: fe1f1c63aad2e84b98a43b7a7d130bff607229d7
QUALIFICATION_REPORT_COMMIT: recorded by the scoped report/status delivery commit
FINAL_BRANCH_HEAD: recorded by the scoped report/status delivery commit
GITHUB_CI_ACTUALLY_RAN: to be verified after push
```

The deterministic adapter is retained because it passed the repository gates:
the official Generate Content request shape, File Search metadata filter,
grounding normalization, safe telemetry, no Interaction fallback, disabled
OpenAI/no-failover behavior, public facade, temporal validation, and diff
hygiene all passed. The target-runtime provider result did not meet the
qualification bound or citation requirement, so the adapter is not selected as
an accepted normal transport under this Work.

## Stop boundary and residual action

CODEX-15 stops at the first actual target-runtime provider-path failure. The
remaining blocker is classified as:

```text
BLOCKED / GEMINI_FILE_SEARCH_PROVIDER_PATH
```

The next action requires user/provider-side investigation of the Gemini
File Search project, credential, quota, or provider path. No further query,
reindex, Store rebuild, model change, credential rotation, or additional
retrieval layer is authorized by this dispatch.
