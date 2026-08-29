# Work 0020 — AI Provider Core

WORK_ID: `0020`
DISPATCH_ID: `0020-CODEX-11`
BALL: `CODEX`
STATUS: `READY`
MODE: `INVESTIGATION -> BUILD / QUALIFICATION`

Primary plan: `docs/planning/work0020-personal-pc-gemini-core-qualification.md`

Active instruction:
`docs/handoffs/0020-CODEX-11-gemini-document-reconciliation-and-final-qualification-instruction.md`

## Primary outcome

Deliver and qualify one provider-neutral Knowledge Search core with exactly three user-facing routes:

```text
ChatGPT
Gemini
全文出力
```

Gemini is the personal-DEV live provider. OpenAI is deliberately deferred/disabled. File Search scope is Meeting + Pitchbook/source. FULL_EXPORT body is Meeting Google Docs full text with optional Pitchbook references only.

## Accepted evidence — closed absent material contradiction

- CODEX-03: schema `6`, exactly five Backend sheets, FULL_OUTPUT runtime/canonical package parity, disabled-provider no-failover, final integrity PASS.
- CODEX-04: one isolated Gemini Store, future zero-code OpenAI activation deterministic PASS, OpenAI uncalled.
- CODEX-05: safe transport-stage diagnostics + bounded retry, repository `274/274 PASS`, version `45`.
- CODEX-06: caller `Content-Length` removed, repository `277/277 PASS`, version `46`.
- CODEX-07: transport/candidate hardening deterministic PASS, repository `282/282 PASS`, version `47`.
- CODEX-08: direct Blob path deterministic PASS, focused `39/39`, repository `280/280`, temporal/public/diff PASS; normal combined queue ordering confirmed.
- CODEX-09: optional administrator `sourceType` contract deterministic PASS, focused `45/45`, repository `286/286`, temporal/public/diff PASS; exact source readback `78/78`; existing private Web App version `48`.
- CODEX-10: authenticated private Web App administrator SYNC path proven; minimal All/Meeting/Pitchbook UI fallback delivered; focused `45/45`, repository `286/286`, exact source readback `78/78`; same private Web App version `49`.

Do not rerun FULL_OUTPUT. Do not live-call OpenAI. Do not reopen accepted selector/direct-Blob transport design absent material contradictory evidence.

## CODEX-10 authoritative blocker

CODEX-10 reached real Gemini provider execution.

The required temporary batch guard was not active: authoritative post-run `AI_SYNC_BATCH_SIZE` remained numeric `10`, so two eligible synthetic Meetings were attempted. Both ended safe permanent `AI_DOCUMENT_READBACK_FAILED` with no accepted local Gemini document identity. No Pitchbook changed. No query, lifecycle, state reset, retry, OpenAI call, FULL_OUTPUT rerun, second deployment, or Library mutation followed.

This is now the active runtime blocker.

## ChatGPT Strategy Reset for CODEX-11

GitHub source and Google’s current official File Search contract were reviewed after CODEX-10.

Relevant source facts:

- `tests/ai-gemini-transport.test.cjs` currently defines successful upload as a completed Operation whose `response.fileSearchDocument` already contains the ACTIVE FileSearchDocument.
- `src/161_GeminiRestClient.gs` calls `kspExtractDocumentFromOperation_()` after a successful Operation and maps extraction failure directly to permanent `AI_DOCUMENT_READBACK_FAILED`.
- `src/131_AiFileSearchContracts.gs` keeps Operation `response` generic but requires a document-shaped resource name when normalizing a FileSearchDocument.
- Google’s current File Search examples poll the upload Operation only until `done`; they do not require the Operation to embed a FileSearchDocument.
- the current API reference describes Operation `response` as a generic object and explicitly notes that some services may not provide a result; File Search Documents have separate list/get APIs.
- provider-core processing already lists existing documents by source before upload, but CODEX-10 failure handling clears local `contentHash` and permanent failure is excluded from future sync eligibility, so the two uncertain rows cannot currently self-reconcile.

One active hypothesis:

> The CODEX-10 Gemini uploads may have created valid FileSearchDocuments, but the application incorrectly treats absence of an embedded document object in the completed upload Operation as permanent failure. The resulting local failure state then prevents safe reconciliation with the already-created provider document.

CODEX-11 must first reproduce this exact gap deterministically. If it does not reproduce, do not patch and return for Strategy Reset.

## CODEX-11 repair boundary

Expected production scope only:

- `src/161_GeminiRestClient.gs`;
- `src/164_AiProviderCore.gs`;
- directly relevant tests;
- `src/160_AiEnvironment.gs` only if a narrow source-type-aware finder signature is required.

Required behavior:

1. Preserve the valid embedded-document fast path.
2. When a completed Gemini upload Operation has no valid embedded document, reconcile through bounded File Search Document list/get using exact `source_type + source_id + content_hash`.
3. Require exactly one ACTIVE exact match; zero/mismatch/ambiguous results fail closed.
4. Make a `FAILED / AI_DOCUMENT_READBACK_FAILED` source eligible for reconciliation-only recovery.
5. If one exact existing document is present, restore local provider state to Indexed without upload/delete.
6. For the uncertain failed state, zero/ambiguous matches must not trigger a new upload or destructive delete.
7. Normal new sources keep the existing upload path, now with repaired post-Operation reconciliation.
8. Preserve redaction, provider neutrality, OpenAI behavior, no-failover, schema, and public surface.

## Live safety gate

Before every provider-mutating sync:

```text
AI_SYNC_BATCH_SIZE = numeric 1
-> authoritative readback = numeric 1
-> only then may SYNC execute
```

If readback is not numeric `1`, STOP before clicking sync.

The first two CODEX-11 Meeting passes are reconciliation-only for the two uncertain CODEX-10 rows, one source per pass. Require one exact ACTIVE existing Gemini document and no upload/delete. If either row has zero or ambiguous exact provider matches, STOP and return; do not re-upload it.

After both affected Meeting rows are reconciled, use one for the grounded Meeting query/citation. Then perform one bounded small synthetic TXT Pitchbook upload/query and only after PASS continue exact metadata filter plus update / Inactive / Reactivate / delete-rebuild lifecycle and final integrity.

Restore batch size to numeric `10`, keep `AI_SYNC_ENABLED=false`, OpenAI disabled/uncalled, and triggers unchanged at the end.

## GitHub evidence note

For CODEX-10 implementation head `e8e022baf7d608b81f8a3bb164636781b46a0011`, GitHub shows zero Actions workflow runs and zero commit status checks. The recorded `45/45` and `286/286` are local/repository execution evidence, not GitHub-hosted CI evidence.

Current `main` has advanced independently after Work 0020 branched. Do not mix an unrelated main integration into the bounded CODEX-11 runtime diagnosis. Integrate current main before final Work merge after the runtime blocker is closed.

## Stop rules

- one active provider hypothesis only;
- no patch if the pre-fix regression does not reproduce;
- one minimal repair attempt;
- one tested source delivery/version/same-Web-App update maximum;
- batch numeric `1` readback is mandatory before live mutating sync;
- no uncertain Meeting re-upload/delete before exact existing-document reconciliation;
- no unrestricted broad sync, new Store, second Web App, Library mutation, new public/debug endpoint, OpenAI live call, FULL_OUTPUT rerun, confidential data, or provider retry loop;
- stop on the first new provider/runtime failure or ambiguous provider document set.

## Closed contracts

- exactly five Backend sheets/schema `6`;
- normal provider-neutral queue remains combined/oldest-first when sourceType is blank;
- independent OpenAI/Gemini derived state;
- stable-ID citation resolution to authoritative Backend/Drive;
- no automatic provider failover;
- Pitchbook body is File Search input but not FULL_EXPORT body;
- no recurring trigger, confidential production data, new Store, second Web App, or Library mutation.

## Target final classification

```text
DEV QUALIFIED — WORK 0020 AI PROVIDER CORE
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

Completion Latch applies only after ChatGPT final review and merge.
