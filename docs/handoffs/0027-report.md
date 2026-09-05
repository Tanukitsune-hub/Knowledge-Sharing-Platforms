# Work 0027 report

WORK_ID: 0027
ACTIVE_DISPATCH_ID: 0027-CODEX-04
BALL: CODEX
STATUS: READY
MODE: INVESTIGATION

## Current outcome

CODEX-03 produced no citation repair. The current controller action is a strategy reset to retained-response recovery and quota preflight with zero new generation or runtime mutation. CODEX-04 has not executed. PR #37 remains Draft/Open/unmerged; main remains 8c9be2392a1247ff81efc6a153fc0be449b1318b at this review.

## Preserved CODEX-02 evidence

```text
REVIEWED_CODEX_02_HEAD: 0032a9cdb69cc1431566dee82f7e2c2196ddee50
IMPLEMENTATION_COMMIT: acd3aa08a3ecc01a7b0852afef8f58202934af82
REPORTED_LOGIC_VALIDATION: PASS / 440 of 440
REPORTED_BUNDLE_GATES: PASS / 27 of 27
REPORTED_SOURCE_READBACK: PASS / 82 of 82
REPORTED_PRIVATE_WEB_APP_VERSION: 72 / shell PASS
GEMINI_3_7_FILE_SEARCH_HTTP: 200
EXPECTED_TOKEN: PASS
FILE_CITATION: PASS / 1
AUTHORITATIVE_IDENTITY_AND_METADATA: FAIL
QUERY_ATTEMPTS_RETRIES: 2 / 1
QUERY_CUMULATIVE_SLEEP_MS: 501
QUERY_TOTAL_LATENCY_MS: 34992
GEMINI_3_6: NOT_RUN
TEMP_RESOURCE_CLEANUP: PASS
GEMINI: disabled / hidden
OPENAI_FULL_OUTPUT_LIVE_CALLS: 0
WORK_ACCEPTANCE: NOT_MET
```

Detailed evidence: `docs/handoffs/0027-CODEX-02-stable-model-file-search-baseline-report.md`.

## CODEX-03 evidence and review

```text
STARTING_REF: 11865c49b17c578713c3c1b4bc5c2307434d50e9
REVIEWED_FINAL_REF: 745e34d8a04df4aaea8a9373775106b4b08b4523
MODEL: gemini-3.7-flash / explicit low / 2048 / Interactions + File Search
DIAGNOSTIC_HTTP: 429
DIAGNOSTIC_CLASSIFICATION: PROVIDER_OR_TRANSIENT_FAILURE
DIAGNOSTIC_ERROR_CODE: too_many_requests
DIAGNOSTIC_ATTEMPTS_RETRIES: 2 / 1
DIAGNOSTIC_CUMULATIVE_SLEEP_MS: 514
DIAGNOSTIC_LATENCY_MS: 21825
MODEL_OUTPUT_BLOCKS: 0
FILE_CITATIONS: 0
CITATION_FIELD_MISMATCH: NOT_ESTABLISHED
REPORTED_TEMP_RESOURCE_CLEANUP: PASS
REPORTED_MUTABLE_SOURCE_READBACK: PASS / 82 of 82
IMPLEMENTATION: NONE
IMMUTABLE_VERSION_CREATED: NO
WEB_APP_UPDATE: NO / version 72 unchanged
```

The detailed CODEX-03 report also discloses a temporary invocation-path modification contrary to its no-monkey-patch instruction. The change was removed; source restoration is reported. That invocation is not qualification evidence. The final user summary alone omitted this limitation, so it must remain visible in controller review. No continuing deployment change or source-code change is shown by the final GitHub diff.

ChatGPT independently checked main/PR/head, full report, dispatch/control documents, the comparison from the CODEX-03 starting ref, Actions and PR discussion. The comparison contains only documentation and generated distribution provenance/hash updates; src/ and tests/ did not change. No Actions runs or discussion entries were returned. ChatGPT did not rerun the user's Apps Script or local test suite and does not independently certify runtime restoration beyond the reported evidence.

Detailed evidence: `docs/handoffs/0027-CODEX-03-citation-identity-repair-report.md`.

## Source findings retained, not declared causes

- Qualification requires citation.source equal to Document.name plus three metadata equalities.
- Citation normalization drops document_uri; synthetic fixtures assume source equals Document.name.
- Normal Gemini mapping differs from qualification mapping.

The official schema documents separate citation fields but does not prove which field failed in CODEX-02. No blind assertion removal or expected-value substitution is authorized.

## Classification

```text
PRODUCT_AVAILABILITY_REGRESSION_OBSERVED: NONE / accepted personal-DEV references preserved
WORK_ACCEPTANCE_BLOCKER: GEMINI_3_7_FILE_CITATION_IDENTITY_OR_METADATA_MISMATCH
DIAGNOSTIC_IMPEDIMENT: HTTP_429_QUOTA_DIMENSION_UNKNOWN
EXECUTION_PROCEDURE_FINDING: NONCOMPLIANT_TEMPORARY_INVOCATION_REMOVED
FIX_SOON: GitHub CI absent
BACKLOG: other models, large files, migration, company rollout
```

429 is compatible with project/model quota throttling, but this report does not identify RPM, TPM, RPD or another limit. The 514ms additional sleep is not evidence that a minute/day quota recovered or that all retry options were exhausted. A new API key or paid tier is not an established fix.

## Next action — CODEX-04

Current instruction: `docs/handoffs/0027-CODEX-04-evidence-recovery-and-quota-preflight-instruction.md`.

First check whether the exact previous synthetic response/Interaction ID and original upload reference remain recoverable. Google documents stored-Interaction retrieval and conditional retention; this is an opportunity, not an assertion of availability. Then inspect the tested personal project's actual usage/rate-limit evidence and establish a compliant invocation route without calling a model or modifying Apps Script.

Return recovered per-field evidence or explicit missing prerequisites. Do not create another temporary Store, change models, bypass an administrator latch, regenerate a bundle, or create version 73 in CODEX-04.

Work acceptance stays NOT_MET. No historical report has been rewritten as successful qualification.

WORK_ID: 0027
ACTIVE_DISPATCH_ID: 0027-CODEX-04
BALL: CODEX
STATUS: READY
