# Work 0020 — CODEX-19 OpenAI native sync scope and partial-failure recovery report

WORK_ID: 0020
DISPATCH_ID: 0020-CODEX-19
MODE: INCIDENT_RECOVERY -> QUALIFICATION
BALL: CHATGPT
STATUS: RETURNED

## Outcome

CODEX-19 repaired the bounded OpenAI native sync-orchestration defect and completed the designated small-source native qualification. Private-admin sync can now target one exact authoritative source, current OpenAI entries are not reselected solely because the legacy shared status remains Pending, item-level source failures preserve a valid provider connection and prior indexed sources, and the UI receives sanitized counts plus safe error codes.

The repaired source was delivered once to the existing standalone Apps Script project as immutable version 57, and the same existing private Web App deployment was updated once. No new Web App, Library, public endpoint or Vector Store was created. No Gemini or FULL_OUTPUT call was made.

## Deterministic repair evidence

The pre-fix source reproduced all five required defects: no exact source selection, broad oldest-first selection, stale legacy Pending reselection, aggregate item failure disabling OpenAI, and safe item details not reaching the browser.

The repair adds:

- optional private-admin `sourceType + sourceId` selection with syntax, type, existence and ambiguity checks;
- exact fail-closed OpenAI reconciliation using provider file identity plus `source_type`, `source_id` and `content_hash` before upload or delete;
- currentness based on a complete OpenAI Indexed entry and `indexedAt >= Updated_At`;
- provider/config failure separated from item-level partial failure;
- upload-first replacement so an item failure does not discard the last known-good indexed source;
- sanitized selected/indexed/unchanged/removed/failed counts and deduplicated safe item error codes in the private-admin UI;
- preserved broad and scheduled behavior when `sourceId` is absent.

Focused OpenAI core/admin tests: PASS, 47/47.

Canonical repository validation: PASS, 325/325.

Temporal validation: PASS.

Public-surface validation: PASS.

Agent foundation validation: PASS.

Diff hygiene: PASS.

## Target-runtime delivery

- exact source delivered/read back once;
- one immutable Apps Script version created: 57;
- the same existing private Web App deployment updated once;
- deployment count unchanged;
- stored OpenAI key preserved without reading, displaying or logging it;
- provider and deployment identifiers remain redacted from this report.

## Native exact-source qualification

`DOC-000017` was reconciled by exact Pitchbook source selection. The initial current-source check returned `Selected 1 / Indexed 0 / Unchanged 1 / Failed 0`, proving reuse without duplicate upload.

The designated Pitchbook metadata was updated to a unique synthetic qualification scope. Exact Inactive sync removed one provider source, Reactivate exact sync rebuilt one source, and the final exact sync returned `Selected 1 / Indexed 0 / Unchanged 1 / Failed 0`. This proves metadata-constrained selection, Inactive exclusion, Reactivate restoration, exact delete/rebuild and final no-duplicate reuse.

One native OpenAI Pitchbook query used exact safe filters for date, GP, asset class, capital type and source type. It returned the expected synthetic grounded answer and exactly one authoritative normalized source: `Pitchbook / DOC-000017`.

One native OpenAI Meeting query used the designated `MTG-000005` metadata and source type. It returned the expected synthetic grounded answer and exactly one authoritative normalized source: `Meeting / MTG-000005`. No Meeting resync was required, so its accepted current Indexed evidence was preserved.

OpenAI was then disabled, the existing synthetic connection test re-established `READY_FOR_SYNC` using the stored key, and a final `DOC-000017` exact sync restored `ACTIVE` with one unchanged source and no failure.

## Side-effect integrity

Only designated synthetic qualification data was used for provider operations. Old 5–25 MiB size-matrix fixtures were not retried, deleted or mutated. No confidential content, Gemini call, provider fallback or FULL_OUTPUT rerun occurred.

During browser qualification, `DOC-000018` metadata was briefly edited because an asynchronous edit-panel transition had not completed. The error was detected before any provider sync, then the row was restored to its original date, GP, asset class, blank capital/fund fields, sequence-02 filename and Active status. Final readback confirms one restored row. No OpenAI upload, deletion or query targeted `DOC-000018`; the restricted Audit may retain the truthful synthetic edit/restore trail.

Final readback confirms one Active `DOC-000017`, one restored Active `DOC-000018`, one Active `MTG-000005`, OpenAI key configured, Vector Store ready and OpenAI state active.

## Required result fields

```text
OPENAI_SYNC_ROOT_CAUSE: PASS — broad oldest-first Pitchbook selection mixed old large fixtures with the intended small source; item timeouts were collapsed into a provider-wide generic failure
OPENAI_EXACT_SOURCE_SYNC: PASS — exact type/ID validation, authoritative existence/ambiguity checks and exact provider identity reconciliation are fail closed
OPENAI_PARTIAL_FAILURE_SEMANTICS: PASS — item failures retain provider usability and last known-good indexed sources; provider/config failures still error and disable safely
OPENAI_ADMIN_SYNC_DIAGNOSTICS: PASS — sanitized counts, provider usability and deduplicated safe item codes reach the private-admin UI without provider IDs
OPENAI_PITCHBOOK_INDEX_QUERY_CITATION: PASS — one native query, grounded expected answer, exactly one authoritative normalized DOC-000017 source
OPENAI_MEETING_INDEX_QUERY_CITATION: PASS — one native query, grounded expected answer, exactly one authoritative normalized MTG-000005 source
OPENAI_METADATA_FILTER: PASS — native date/GP/asset/capital/source-type constraint isolated DOC-000017
OPENAI_LIFECYCLE: PASS — current reuse, update scope, Inactive removal, Reactivate rebuild, exact delete/rebuild, disable/re-enable and final unchanged reuse
LARGE_FILE_INDEXING_FOLLOW_UP: OPEN — old 5–25 MiB OPENAI_INDEX_TIMEOUT fixtures were preserved and were not broad-retried; separate bounded work is required
LOGIC_VALIDATION: PASS — focused 47/47; canonical 325/325; temporal, public-surface, agent-foundation and diff hygiene PASS
TARGET_RUNTIME_QUALIFICATION: PASS — existing private Web App version 57, designated synthetic sources only
FULL_OUTPUT_RUNTIME: NOT RUN — prohibited in CODEX-19; accepted prior PASS preserved
FINAL_INTEGRITY: PASS — final authoritative rows, provider readiness, exact deployment/version and no-duplicate behavior read back
RUNTIME_LOCATOR_VERIFIED: PASS — project, deployment type/access, existing deployment and version verified; sensitive values intentionally not recorded
RUNTIME_LOCATOR_UPDATED: PASS
READY: YES
BLOCKER: NONE
FINAL_COMMIT: THIS_COMMIT — exact pushed SHA is reported in the PR and final return
GITHUB_CI_ACTUALLY_RAN: pending exact pushed-head observation
```

## Residual follow-up

Large-file OpenAI indexing timeouts remain real item-level follow-up evidence. They do not invalidate the now-qualified small-source OpenAI path and must be addressed separately without broad retry or cosmetic fixture mutation.

WORK_ID: 0020
DISPATCH_ID: 0020-CODEX-19
BALL: CHATGPT
STATUS: RETURNED
