# Work 0020 report

WORK_ID: `0020`
ACTIVE_DISPATCH_ID: `0020-CODEX-11`
BALL: `CODEX`
DISPATCH_STATUS: `RETURNED / BLOCKER`

## Current Work classification

```text
LOGIC_VALIDATION: PASS
SCHEMA_ALIGNMENT: PASS
OPENAI_RUNTIME: SAFE_DISABLED_ERROR — deliberately deferred by user
GEMINI_DOCUMENT_RECONCILIATION: PASS
GEMINI_RUNTIME: BLOCKED — bounded Pitchbook query remained pending
FULL_OUTPUT_RUNTIME: PASS — accepted CODEX-03 evidence
FINAL_INTEGRITY: PARTIAL — dependent Gemini gates not run
READY: NO
BLOCKER: YES
```

Work 0020 remains incomplete. CODEX-11 repaired and qualified the two
uncertain Meeting documents, then stopped at the first new Pitchbook query
runtime blocker. The detailed report is:

`docs/handoffs/0020-CODEX-11-gemini-document-reconciliation-and-final-qualification-report.md`

The temporary AI_SYNC_BATCH_SIZE was restored to numeric 10 and read back.

## CODEX-10 GitHub-verified result

GitHub source of truth confirms:

- branch `agent/0020-ai-provider-core`;
- CODEX-10 implementation head `e8e022baf7d608b81f8a3bb164636781b46a0011`;
- PR `#26` remains Draft / Open / unmerged / currently mergeable;
- CODEX-10 delta from CODEX-09 contains only the CODEX-10 handoff/report/tracking documents, minimal AI-provider admin UI fallback, and its deterministic admin test; no Gemini transport/provider-core source was changed in CODEX-10;
- focused provider/core/admin/transport/sync tests recorded `45/45 PASS`;
- `npm run check` recorded `286/286 PASS`;
- temporal/public-surface/diff validation recorded PASS; public facade `30`;
- exact source readback `78/78`;
- existing private Web App updated in place to immutable version `49`;
- authenticated private Web App administrator SYNC execution succeeded once.

Authoritative runtime outcome:

- intended batch guard `1` was not in effect; post-run readback remained numeric `10`;
- two eligible synthetic Meetings were attempted;
- both ended `FAILED` with safe `AI_DOCUMENT_READBACK_FAILED`, attempt `1`, retryable `false`, permanent `true`, and no accepted local Gemini document identity/indexed timestamp/content hash;
- no Pitchbook changed;
- no Meeting query, Pitchbook sync/query, lifecycle mutation, retry/state reset, or dependent final-integrity gate ran;
- `AI_SYNC_ENABLED=false`, `GEMINI_ENABLED=true`, `OPENAI_ENABLED=false`;
- OpenAI was not called and FULL_OUTPUT was not rerun.

Detailed CODEX-10 report:
`docs/handoffs/0020-CODEX-10-webapp-admin-sync-and-gemini-final-qualification-report.md`

## GitHub diff interpretation

CODEX-10 itself did not introduce the failing Gemini readback implementation. Its code delta only enabled the bounded administrator UI route needed to reach the already-existing provider path. The observed defect is therefore in the prior Gemini/provider reconciliation code now exercised by the target runtime.

## ChatGPT independent root-cause review

### Production source

Current `src/161_GeminiRestClient.gs` behavior after a successful upload Operation:

```text
poll Operation to done
-> kspExtractDocumentFromOperation_(operation)
-> normalize FileSearchDocument resource name
-> GET/read/verify the document
```

If the completed Operation does not contain a document-shaped response, extraction is caught and converted directly to permanent:

```text
AI_DOCUMENT_READBACK_FAILED
stage = DOCUMENT_READBACK
retryable = false
```

Current `src/131_AiFileSearchContracts.gs` correctly treats Operation `response` as a generic object, but `kspNormalizeFileSearchDocument_()` requires a concrete `fileSearchStores/.../documents/...` resource name.

### Deterministic test gap

The main successful transport fixture in `tests/ai-gemini-transport.test.cjs` currently simulates:

```text
done=true
response.fileSearchDocument = ACTIVE synthetic document
```

It therefore never exercises a successful completed Operation whose generic response does not embed the FileSearchDocument but whose document is discoverable through the File Search Documents API.

### Provider-core reconciliation gap

The provider-neutral sync already lists existing provider documents by source before upload. However:

- permanent failed entries are excluded from normal eligibility;
- failure handling clears local `documentName`, `providerDocumentId`, `indexedAt`, and `contentHash`;
- existing unchanged reconciliation relies on local provider state as part of matching.

Thus a provider-side document created by CODEX-10 can remain orphaned from local derived state and the row cannot safely self-reconcile.

## Current official Gemini contract review

Google’s current File Search documentation shows direct upload returning a long-running Operation and the SDK examples only poll until `operation.done`. They do not require the completed Operation to contain an embedded FileSearchDocument resource.

The current File Search Stores API reference describes Operation `response` as a generic arbitrary object and states that some services might not provide a result. File Search Documents are separately listable/gettable/deletable under the Store.

Official sources prepared for CODEX-11:

- `https://ai.google.dev/gemini-api/docs/file-search`
- `https://ai.google.dev/api/file-search/file-search-stores`

## Strategy Reset — CODEX-11

One active hypothesis:

> The CODEX-10 uploads may have completed successfully and created valid Gemini FileSearchDocuments, but the application incorrectly requires the completed upload Operation to embed the document resource. Absence of that shape is recorded as permanent local failure, and the failure-state rules then prevent reconciliation with an already-created provider document.

Expected pre-fix deterministic proof:

1. completed successful Operation has no embedded FileSearchDocument;
2. document list/get exposes exactly one ACTIVE exact match on `source_type + source_id + content_hash`;
3. current transport path nevertheless throws `AI_DOCUMENT_READBACK_FAILED`;
4. current provider-core state shaped like CODEX-10 does not reconcile the existing document.

If this does not reproduce, CODEX-11 must stop without production patch or provider mutation.

Minimal repair boundary:

- keep existing embedded-document fast path;
- add bounded exact list/get reconciliation when Operation does not provide a usable document resource;
- require exactly one ACTIVE exact metadata/hash match;
- allow only `AI_DOCUMENT_READBACK_FAILED` failed rows to enter reconciliation-only recovery;
- one exact existing provider document repairs local state to Indexed without upload/delete;
- zero/ambiguous exact matches perform no new upload/delete and stop safely;
- normal new sources keep the existing upload path;
- preserve OpenAI, public surface, redaction, no-failover, schema, queue, and transport behavior.

Active instruction:
`docs/handoffs/0020-CODEX-11-gemini-document-reconciliation-and-final-qualification-instruction.md`

## CODEX-11 live evidence order

```text
pre-fix regression reproduced
-> minimal deterministic repair PASS
-> one tested source delivery/version/same-Web-App update
-> batch numeric 1 + exact readback
-> reconcile uncertain CODEX-10 Meeting #1 without upload/delete
-> batch numeric 1 + exact readback
-> reconcile uncertain CODEX-10 Meeting #2 without upload/delete
-> one Meeting grounded query + citation
-> batch numeric 1 + exact readback
-> one small synthetic TXT Pitchbook upload/index/query
-> exact metadata filter
-> update / Inactive / Reactivate / delete-rebuild
-> restore batch numeric 10 / AI sync disabled
-> final integrity
```

The two uncertain Meeting rows are repaired first because another blind upload could create or obscure duplicate provider-derived state.

## Findings classification

### BLOCKER

1. Gemini document reconciliation/readback is not qualified. Two CODEX-10 Meetings are locally failed after actual provider execution and provider-side document existence is not yet reconciled.
2. The qualification safety precondition `AI_SYNC_BATCH_SIZE=1` was not actually in force during CODEX-10. No further provider-mutating sync may run until numeric `1` is set and immediately read back.

### FIX SOON

1. GitHub-hosted CI/check evidence remains absent. For CODEX-10 implementation head, Actions runs = `0` and commit status checks = `0`; do not call the local `45/45` / `286/286` evidence CI PASS.
2. The Work branch currently diverges from newer `main` and is behind it. Do not mix unrelated main integration into the bounded runtime diagnosis; integrate current main before final Work merge after the blocker is closed.

### BACKLOG

None created from this review. Do not expand Work 0020 beyond its existing provider-core completion boundary.

## Accepted evidence preserved

- CODEX-03: schema `6`, five Backend sheets, FULL_OUTPUT runtime/canonical parity, disabled-provider no-failover, final integrity PASS.
- CODEX-04: one isolated Gemini Store; OpenAI future activation deterministic evidence; OpenAI uncalled.
- CODEX-05 through CODEX-07: bounded retry, Content-Length, request-shape/direct transport hardening accepted.
- CODEX-08: direct Blob deterministic PASS and normal combined queue ordering accepted.
- CODEX-09: sourceType filtering-before-slice and exact version-48 delivery accepted.
- CODEX-10: authenticated private Web App administrator execution path and version-49 minimal UI fallback accepted.

Do not reopen these conclusions absent material contradictory evidence.

## GitHub evidence status

For CODEX-10 implementation head `e8e022baf7d608b81f8a3bb164636781b46a0011`:

```text
GitHub Actions workflow runs: 0
commit status checks: 0
```

Recorded deterministic test results are Codex/local repository evidence only.

## Target final matrix

```text
DEV QUALIFIED — WORK 0020 AI PROVIDER CORE
LOGIC_VALIDATION: PASS
SCHEMA_ALIGNMENT: PASS
OPENAI_RUNTIME: SAFE_DISABLED_ERROR — deliberately deferred by user
GEMINI_DOCUMENT_RECONCILIATION: PASS
GEMINI_RUNTIME: PASS
FULL_OUTPUT_RUNTIME: PASS
FINAL_INTEGRITY: PASS
READY: YES
BLOCKER: NO
```

WORK_ID: `0020`
ACTIVE_DISPATCH_ID: `0020-CODEX-11`
BALL: `CODEX`
DISPATCH_STATUS: `READY`
WORK_READY: `NO`
BLOCKER: `YES`
