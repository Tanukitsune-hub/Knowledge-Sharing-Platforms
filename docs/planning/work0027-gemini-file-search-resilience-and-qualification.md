# Work 0027 — Gemini GAS File Search resilience and qualification

WORK_ID: 0027
MODE: BUILD
ACTIVE_DISPATCH_ID: 0027-CODEX-05
BALL: CODEX
STATUS: READY

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

## Strategy reset: investigation completed, BUILD resumes

No more blind diagnostics or model switches. Implement the observed field contract now. The new identity chain is:

```text
real file_citation annotation
-> document_uri exactly equals trusted request/config Store
-> exact source_type + source_id + content_hash
-> unique independently verified Active provider Document in that Store
-> unique authorized Active authoritative source and current GEMINI hash
-> authoritative user-facing source/link
```

source text and file_name are not identity. Do not hash an excerpt or remove a newline to create an identity proof. Never fill missing returned identity from expected request fields. Reject missing/conflicting/stale/ambiguous/foreign-Store bindings. Preserve distinct annotations until verified, then deduplicate equivalent results. Use one shared resolver in qualification and normal immediate/POLL completion; keep OpenAI logic unchanged.

## Scope and evidence

Fix normalization, citation resolution, trusted readback context and direct callers/tests only. Preserve the CODEX-04 fixture as historical sanitized evidence. Unit-test companion source/document data is fictitious, not reconstruction of unavailable old values.

Strongest evidence: one repaired 3.7 live answer and citation bound to fresh independently read-back synthetic document, through qualification and normal mapper; cleanup confirmation; exact source/version/shell; recovered-shape and rejection tests; canonical/bundle/security checks. A stored old response is not a fresh runtime PASS.

## CODEX-05 bounds

One logical File Search query, <=2 generation HTTP attempts under existing safeguards; no additional diagnosis, Models, short generation, other model/transport, OpenAI or FULL_OUTPUT calls. One temporary Store/TXT, cleanup confirmed. No existing source or Store mutation. One final source delivery/readback, at most immutable version 73, one update of the same verified private WEB_APP from 72 to 73. Never deploy 67 or create 74+. No scratch invocation or administrator bypass.

Check fresh same-project quota without a probe; the old snapshot is not capacity assurance. If confirmation is blocked, preserve the tested implementation and report the exact unverified runtime gate. Do not use a new key/project or billing change as a workaround. Exact retry/time/cleanup boundaries are in the detailed instruction.

## Completion latch

Only correctly evidenced QUALIFIED_DISABLED satisfies Work acceptance. Keep Gemini disabled/hidden pending final review, and do not transfer temporary-Store qualification to the configured real Store. PR #37 remains Draft/Open/unmerged until ChatGPT reviews final diff, tests and live evidence. One final consistency check after acceptance; no additional benchmark/hardening gate.

Large files, company credentials/permissions/quota policy, migration, other models and rollout are follow-ups. No confidential indexing is authorized.

WORK_ID: 0027
ACTIVE_DISPATCH_ID: 0027-CODEX-05
BALL: CODEX
STATUS: READY
