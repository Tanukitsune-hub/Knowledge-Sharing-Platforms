# Work 0027 report

WORK_ID: 0027
ACTIVE_DISPATCH_ID: 0027-CODEX-05
BALL: CHATGPT
STATUS: RETURNED
MODE: BUILD

## Current outcome

Work 0027 reached its personal-DEV baseline: `gemini-3.7-flash / explicit low / 2048 / Interactions + File Search` returned a grounded answer and an authoritative current citation through the shared strict resolver. CODEX-05 deployed the exact tested source as version 73, confirmed temporary-resource deletion, and persisted the tuple as qualified but disabled. Gemini remains hidden from normal users pending ChatGPT review.

```text
IMPLEMENTATION_COMMIT: 40905f23d8c6bab5b76e7fb2f34f96b912aeb2f7
FINAL_COMMIT: resolve from PR #37 head and final return
LOGIC_VALIDATION: PASS / 448 of 448
TARGET_RUNTIME_QUALIFICATION: PASS
TERMINAL_OUTCOME: QUALIFIED_DISABLED
TEMP_RESOURCE_CLEANUP: PASS
WORK_ACCEPTANCE: MET
READY: YES / ChatGPT final review
BLOCKER: NONE
```

Main at execution: `8c9be2392a1247ff81efc6a153fc0be449b1318b`. Branch: `agent/0027-gemini-file-search-resilience`. PR #37 remains Draft/Open/unmerged.

## CODEX-05 result

The recovered CODEX-04 response deterministically reproduced the old invalid assumption that content-valued `source` was provider Document identity. The repaired implementation keeps `document_uri` as trusted Store scope and resolves exact `source_type`, `source_id`, and `content_hash` through one Active authoritative source/current Gemini hash and one independently read-back current provider document. It rejects missing, conflicting, stale, inactive, ambiguous, foreign-Store, filename-only, token-only, singleton-Store, excerpt-hash, and OpenAI-only identity evidence. Validation precedes equivalent-annotation deduplication. Qualification and normal immediate/POLL completion use the same resolver; OpenAI remains unchanged.

Deterministic validation passed: dedicated resolver 8/8, focused 111/111, canonical 448/448, bundle 27/27, agent foundation, temporal/public surface/security, byte-identical bundle generation, diff hygiene, and secret scan. Exact Apps Script source readback passed 82/82.

The same verified private Web App was updated once from version 72 to 73. Root and Knowledge Search bootstrapped with zero literal include directives and zero application-blocking console errors. One extension-origin console error was external tooling only.

Fresh same-project Free-tier preflight showed viable 3.7 capacity. The post-run view showed 1/5 RPM, 200/250K TPM, and 1/20 RPD. The ordinary guarded administrator action created one temporary Store and one tiny synthetic TXT, indexed and independently read back exactly one current document, made one logical File Search query, matched the expected token, resolved exactly one authoritative citation with normal-mapper parity, and confirmed deletion. The Apps Script action duration was 25.554 seconds.

The administrator client did not durably retain the returned safe per-request diagnostic, so exact response-embedded attempt/retry/query-latency, source-category, and raw-citation-count fields remain `NOT_RETAINED`; no values were invented. The persisted `QUALIFIED_DISABLED` branch and successful action require the strict per-field gates and cleanup to pass. The optional sanitized Audit append was not observed; route this evidence-retention gap to FIX SOON rather than weakening or repeating qualification.

## Preserved evidence

- CODEX-01 final `2c6cd20bfe6a4ef3b6262160b4126266307222dd`: bounded retry/upload recovery; 3.8 transient query failure; cleanup PASS.
- CODEX-02 final `0032a9cdb69cc1431566dee82f7e2c2196ddee50`: 3.7 answer/token/citation but strict identity mismatch; cleanup PASS.
- CODEX-03 final `745e34d8a04df4aaea8a9373775106b4b08b4523`: bounded 429 diagnostic; no repair/deployment; noncompliant temporary invocation excluded.
- CODEX-04 final `18226013d6f98a5cb2bffdf72ced52e766a8b698`: exact sanitized response shape recovered without generation or mutation.

Prior reports and the recovered fixture remain unchanged. Work 0026 and accepted OpenAI, FULL_OUTPUT, structured-search, bundle, and installer evidence remain preserved.

## Final integrity

```text
DEPLOYED_VERSION: 73
VERSION_67_DEPLOYED: NO
VERSION_74_OR_HIGHER_CREATED: NO
GEMINI_MODEL_DEFAULT_CANDIDATE: gemini-3.7-flash
GEMINI_THINKING: low
GEMINI_ENABLED: false
NORMAL_USER_GEMINI_VISIBILITY: false
AUTOMATIC_MODEL_OR_PROVIDER_FALLBACK: NO
EXISTING_GEMINI_STORE_OR_BUSINESS_SOURCE_MUTATION: 0
TEMPORARY_PROVIDER_RESOURCES_REMAINING: 0
OPENAI_CALLS: 0
FULL_OUTPUT_LIVE_CALLS: 0
GITHUB_CI_ACTUALLY_RAN: NO at report preparation time
PRODUCT_BLOCKER: NONE
FIX_SOON: persist allowlisted qualification evidence when Audit is configured
FOLLOW_UP: company credentials/quota/permissions, representative large files, migration and rollout
```

No second diagnostic/model campaign is authorized. Any new execution requires `0027-CODEX-06`; final activation, company qualification, PR readiness, and merge remain ChatGPT decisions.

## Shared Knowledge

```text
KNOWLEDGE_RETRIEVAL: RULE-0001, RULE-0002, PAT-0002, PAT-0004
KNOWLEDGE_APPLIED: RULE-0001, RULE-0002, PAT-0004
NEW_KNOWLEDGE_CANDIDATE: YES
```

WORK_ID: 0027
ACTIVE_DISPATCH_ID: 0027-CODEX-05
BALL: CHATGPT
STATUS: RETURNED
