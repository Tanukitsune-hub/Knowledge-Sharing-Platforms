# Work 0027 — Gemini GAS File Search resilience and qualification

WORK_ID: 0027
MODE: BUILD
ACTIVE_DISPATCH_ID: 0027-CODEX-05
BALL: CHATGPT
STATUS: RETURNED

## Primary outcome and current contract

A personal-DEV Gemini Interactions + File Search baseline with current authoritative citation identity, before company qualification. Use 3.7/low/2048; model novelty is not required. Optional-provider safe shutdown is not the requested grounded-search success.

Current instruction: `docs/handoffs/0027-CODEX-05-strict-citation-resolver-instruction.md`.
Current ball: `docs/handoffs/0027-dispatches.md`.

## Preserved evidence

Main at review: `8c9be2392a1247ff81efc6a153fc0be449b1318b`.
Work 0026 remains ACCEPTED, PR #36 merge `40bb7d40506c0839c35742ee0000d89650ff7ad6`. OpenAI/FULL_OUTPUT, structured search, bundle/installer evidence remain closed. Independent company-GAS evidence is not company File Search qualification.

CODEX-01 implemented bounded retry/auth separation and GAS upload recovery; 431/431 checks, version 71, upload/index/readback and cleanup PASS; 3.8 query HTTP 500/api_error/68442ms.

CODEX-02 final `0032a9cdb69cc1431566dee82f7e2c2196ddee50`: 440/440 checks, version 72, readback 82/82 and shell PASS; 3.7 HTTP 200 with token and citation but strict identity mismatch; 3.6 not called; cleanup PASS.

CODEX-03 final `745e34d8a04df4aaea8a9373775106b4b08b4523`: diagnostic HTTP 429, no citation or fix/version/deployment. Cleanup/source restoration reported. Its noncompliant temporary invocation change was removed and is not acceptance evidence.

CODEX-04 final `18226013d6f98a5cb2bffdf72ced52e766a8b698`: exact stored CODEX-02 response recovered without generation. source is content text, document_uri is requested Store, exact object custom_metadata present, three equivalent raw annotations. Original upload/readback Document name UNAVAILABLE. Existing guarded administrator Web App route available, not invoked. Historical Free-tier snapshot and prior 429's unknown category are preserved in its report. No src/tests/dist/provider/runtime mutation.

## CODEX-05 completed result

CODEX-05 implemented the observed field contract. The shared identity chain is:

```text
real file_citation annotation
-> document_uri exactly equals trusted request/config Store
-> exact source_type + source_id + content_hash
-> unique independently verified Active provider Document in that Store
-> unique authorized Active authoritative source and current GEMINI hash
-> authoritative user-facing source/link
```

source text and file_name are not identity. The resolver does not hash excerpts, fill missing returned identity from expected fields, or infer identity from one document in a Store. It rejects missing/conflicting/stale/inactive/ambiguous/foreign-Store bindings, validates annotations before deduplication, and is shared by qualification and normal immediate/POLL completion. OpenAI logic remains unchanged.

## Acceptance evidence

Implementation commit: `40905f23d8c6bab5b76e7fb2f34f96b912aeb2f7`. The CODEX-04 fixture remains unchanged historical sanitized evidence; companion source/document test data is fictitious.

One repaired 3.7 live answer/citation was bound to a fresh independently read-back synthetic document through qualification and the normal mapper. Cleanup, exact 82/82 source readback, version-73 shell, recovered-shape/negative tests, 448/448 canonical checks, bundle 27/27, and security/foundation checks passed. The Store/TXT were deleted and absence confirmed.

Fresh same-project quota evidence showed 1/5 RPM, 200/250K TPM and 1/20 RPD after the single campaign. The exact response-embedded transport counters were not durably retained by the administrator client and are not invented. The optional safe Audit append was not observed and is a FIX SOON evidence-retention gap, not acceptance evidence.

## Consumed CODEX-05 bounds

One logical File Search query, one temporary Store/TXT, one source delivery/readback, one immutable version 73, and one update of the same private Web App from 72 to 73 were consumed. Models, short generation, other models/transports, OpenAI, FULL_OUTPUT, existing Store/source mutation, scratch invocation, and administrator bypass were not used. Version 67 remains undeployed and no version 74+ was created. The same-project quota check used no probe, key/project change, or billing change.

## Completion latch

`QUALIFIED_DISABLED` satisfies the personal-DEV Work acceptance gate. Gemini remains disabled/hidden pending final review, and the temporary-Store result was not transferred to an existing configured Store. PR #37 remains Draft/Open/unmerged until ChatGPT reviews the final diff, tests, and live evidence.

Large files, company credentials/permissions/quota policy, migration, other models and rollout are follow-ups. No confidential indexing is authorized.

WORK_ID: 0027
ACTIVE_DISPATCH_ID: 0027-CODEX-05
BALL: CHATGPT
STATUS: RETURNED
