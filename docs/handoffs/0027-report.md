# Work 0027 report

WORK_ID: 0027
ACTIVE_DISPATCH_ID: 0027-CODEX-05
BALL: CODEX
STATUS: READY
MODE: BUILD

## Current outcome

ChatGPT reviewed CODEX-04 at `18226013d6f98a5cb2bffdf72ced52e766a8b698`. Evidence recovery is accepted for diagnosis, not Work qualification. The old source-as-Document-ID assumption rejects the observed content-valued citation. CODEX-05 now has a fixed shared resolver design and one bounded personal-DEV confirmation. No CODEX-05 source change, runtime mutation or new test PASS is claimed by this controller update.

Main at review: `8c9be2392a1247ff81efc6a153fc0be449b1318b`.
Branch: `agent/0027-gemini-file-search-resilience`.
PR #37 remains Draft/Open/unmerged. Runtime remains version 72.

## CODEX-04 independent review

Checked latest PR/head and main, exact report, sanitized fixture, applicable AGENTS and deployment policy, current normalizer/qualifier/normal mapper, comparison from `9dad26cec30580050f371284a5ad8d2f2cc8b3d2`, Actions and PR discussion. The returned delta contains only documents and the sanitized JSON fixture, no src/tests/dist changes. No Actions runs or discussion entries were returned. ChatGPT did not run local tests or inspect the user's authenticated runtime; quota and runtime observations below are Codex's recorded evidence.

Google's current FileCitation schema lists source, document_uri and custom_metadata separately. File Search documentation supports metadata and provider Document read/list. These constrain the repair; the recovered response, not a schema guess, establishes this instance's field shape.

## Preserved runtime evidence

### CODEX-02

Final `0032a9cdb69cc1431566dee82f7e2c2196ddee50`; implementation `acd3aa08a3ecc01a7b0852afef8f58202934af82`. Reported logic 440/440, bundle 27/27, source 82/82 and version-72 shell PASS. 3.7 File Search returned HTTP 200, expected token and one normalized citation, attempts 2/retry 1, sleep 501ms, total 34992ms. Strict identity failed; 3.6 was not called; temporary resources cleaned up.

### CODEX-03

Final `745e34d8a04df4aaea8a9373775106b4b08b4523`. Diagnostic HTTP 429/too_many_requests, attempts 2/retry 1, sleep 514ms, 21825ms; no annotation/repair/version/deployment. Cleanup/source restoration 82/82 reported. The disclosed temporary invocation-path modification violated its boundary, was removed and is not qualification evidence. It must not be repeated.

### CODEX-04

Final `18226013d6f98a5cb2bffdf72ced52e766a8b698`. Exact prior response recovered in place without generation or provider mutation. Three equivalent raw annotations, one unique citation. source CONTENT_TEXT, document_uri STORE equal to requested Store, object custom_metadata with source_type/source_id/content_hash. No provider Document identity appeared in the response; the original upload/readback Document name remains UNAVAILABLE.

The fixture's excerpt/hash newline relationship is diagnostic only. It is not proof of the original full-document binding or a rule for hashing retrieved chunks. Requalification must bind a new independent document readback; CODEX-02 is not retrospectively changed to PASS.

Same-project quota observation at 2026-09-05 11:05 JST: Free tier, last-hour RPM 3/5, TPM 394/250000, RPD 3/20. The 28-day RPM peak 6/5 does not establish the exact previous 429 dimension/reset, which remains UNKNOWN. The ordinary administrator Web App qualification action was available, not executed.

Exact reports and recovered fixture remain unchanged under `docs/handoffs/0027-CODEX-02-*`, `0027-CODEX-03-*` and `0027-CODEX-04-*`.

## Current classification

```text
CODEX_04_DIAGNOSTIC_REVIEW: ACCEPTED / EVIDENCE_RECOVERED
OBSERVED_MISMATCH: SOURCE_CONTENT_IS_NOT_PROVIDER_DOCUMENT_IDENTITY
CODEX_05_IMPLEMENTATION: NOT_RUN
CODEX_05_RUNTIME_QUALIFICATION: NOT_RUN
WORK_ACCEPTANCE: NOT_MET
BLOCKER: GEMINI_3_7_FILE_CITATION_IDENTITY_OR_METADATA_MISMATCH
PRODUCT_AVAILABILITY_REGRESSION_OBSERVED: NONE / personal-DEV reference paths preserved
GEMINI: disabled / hidden
FIX_SOON: GitHub CI absent
FOLLOW_UP: company quota/billing/governance and permissions, larger files, migration, other models
```

## Next decisive action

Execute `docs/handoffs/0027-CODEX-05-strict-citation-resolver-instruction.md`: shared strict Store/metadata/current-document/authoritative-source resolution, recovered-shape regression plus rejection tests, then one guarded 3.7 confirmation and cleanup. No renewed diagnostic campaign. Passing only the qualifier or deleting the old equality without replacing its identity guarantee is insufficient.

CODEX-05 may retain a completed tested implementation if live quota prevents confirmation, but cannot claim Work acceptance. Final merge/activation remains ChatGPT's decision.

WORK_ID: 0027
ACTIVE_DISPATCH_ID: 0027-CODEX-05
BALL: CODEX
STATUS: READY
