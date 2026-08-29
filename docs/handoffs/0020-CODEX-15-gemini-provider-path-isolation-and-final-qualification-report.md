# Work 0020 — CODEX-15 Gemini provider-path isolation and final qualification

WORK_ID: `0020`
DISPATCH_ID: `0020-CODEX-15`
BALL: `CHATGPT`
STATUS: `RETURNED / BLOCKER`

## Outcome

The existing CODEX-14 opaque job was polled once, read-only. Its token had expired after the already recorded long-running observation, so no new Interaction was created and no provider identifier was recovered.

The bounded Generate Content + File Search qualification was then attempted exactly once against the existing synthetic indexed Pitchbook. The Web App returned the safe service-unavailable category after `83364ms`, with no answer and no authoritative citation. No query retry, upload, reindex, lifecycle mutation, Store change, or deployment expansion was performed.

## Qualification record

```text
EXISTING_INTERACTION_DISPOSITION: EXPIRED / NOT OBSERVABLE
EXISTING_INTERACTION_TOTAL_ELAPSED_MS: >=600000 — accepted CODEX-14 observation
EXISTING_INTERACTION_CANCELLED: NO — token expired; raw provider ID unavailable
GENERATE_CONTENT_FILE_SEARCH: FAIL — safe application category only
GENERATE_CONTENT_BROWSER_TOTAL_MS: 83364
GENERATE_CONTENT_SERVER_MS: NOT_SAFELY_OBSERVABLE
GENERATE_CONTENT_HTTP_STATUS: NOT_AVAILABLE
GENERATE_CONTENT_PROVIDER_TERMINAL_STATUS: NOT OBSERVED
SELECTED_GEMINI_QUERY_TRANSPORT: NONE QUALIFIED
PITCHBOOK_AUTHORITATIVE_CITATIONS: 0
METADATA_FILTER: NOT RUN — dependent on grounded query PASS
LIFECYCLE: NOT RUN — dependent on grounded query PASS
LOGIC_VALIDATION: PASS — 109 focused AI tests; 307/307 repository check
GEMINI_DOCUMENT_RECONCILIATION: PASS — accepted prior evidence
GEMINI_RUNTIME: BLOCKED / DIRECT PROVIDER ISOLATION REQUIRED
FULL_OUTPUT_RUNTIME: PASS — accepted prior evidence; not rerun
STATE_INTEGRITY: PARTIAL — no unexpected mutation observed; final readback not run
FINAL_INTEGRITY: NOT RUN — CODEX-15 stop condition
READY: NO
BLOCKER: YES
IMPLEMENTATION_COMMIT: fe1f1c63aad2e84b98a43b7a7d130bff607229d7
QUALIFICATION_REPORT_COMMIT: af71a23f4d4c088d9e56eda2c63ee800a08f682a
FINAL_RETURNED_BRANCH_HEAD: 54ccb4a2f3d162927ac2a24df46ec829adc62b91
GITHUB_CI_ACTUALLY_RAN: NO
```

## Interpretation boundary

The deterministic Generate Content adapter is retained as implementation evidence because its official request shape, File Search metadata filter, grounding normalization, safe telemetry, no-Interaction fallback, disabled OpenAI/no-failover behavior, public facade, temporal validation, and diff hygiene passed.

The target-runtime result did not meet the qualification bound or citation requirement. The safe public error does not reveal whether the cause was an HTTP provider response, quota/project condition, transport termination, unsupported live request behavior, or a broader File Search path failure.

No text-only base-model control or direct same-project SDK control was run outside Apps Script. Therefore CODEX-15 does not prove a Google provider incident and does not accept Generate Content as the normal transport.

## Source-state warning

The pushed source/version `54` currently defaults `QUERY_TRANSPORT` to `GENERATE_CONTENT` even though the transport was not accepted. PR `#26` must remain Draft and unmerged, and the private DEV Gemini route is not user-ready. A later evidence-selected dispatch must correct the transport/default before merge.

## Stop boundary and next action

CODEX-15 stopped correctly after the first target-runtime failure. The next decisive action is CODEX-16 direct provider qualification outside Apps Script using a same-project local API key and synthetic temporary controls.

No further Web App query, reindex, Store rebuild, model change, credential rotation, or retrieval architecture is authorized merely from CODEX-15 evidence.

WORK_ID: `0020`
DISPATCH_ID: `0020-CODEX-15`
BALL: `CHATGPT`
STATUS: `RETURNED / BLOCKER`
