# Work 0027 dispatch control

WORK_ID: 0027
ACTIVE_DISPATCH_ID: 0027-CODEX-04
BALL: CHATGPT
STATUS: RETURNED
MODE: INVESTIGATION

## Current dispatch — returned investigation

`0027-CODEX-04` — read-only retained-response recovery, same-project quota preflight and compliant invocation-path review.

Instruction: `docs/handoffs/0027-CODEX-04-evidence-recovery-and-quota-preflight-instruction.md`
Report: `docs/handoffs/0027-CODEX-04-evidence-recovery-and-quota-preflight-report.md`

CODEX-04 recovered the exact CODEX-02 stored Interaction through its retained correlation, identified the content-valued citation `source`, inspected same-project quota without a probe, and proved the existing guarded Web App administrator route. It made no product/runtime/provider mutation.

```text
MODEL_CONTEXT: gemini-3.7-flash / low / 2048
CURRENT_RUNTIME: version 72 / unchanged by CODEX-03
WORK_ACCEPTANCE: NOT_MET
WORK_ACCEPTANCE_BLOCKER: GEMINI_3_7_FILE_CITATION_IDENTITY_OR_METADATA_MISMATCH
RECOVERED_CITATION_SHAPE: source=CONTENT_TEXT / document_uri=STORE / exact custom_metadata present
CODEX_03_429_QUOTA_CATEGORY: UNKNOWN
CURRENT_VISIBLE_QUOTA: Free / 3.7 last-hour RPM 3 of 5 / TPM 394 of 250000 / RPD 3 of 20
CODEX_04_EXECUTION: EVIDENCE_RECOVERED
NEW_GENERATION_OR_MODELS_CALLS: 0
STORE_DOCUMENT_MUTATIONS: 0
APPS_SCRIPT_SOURCE_VERSION_DEPLOYMENT_MUTATIONS: 0
BILLING_KEY_OR_SECURITY_CHANGES: 0
GEMINI: disabled / hidden
```

The stored response was inspected in place and represented only by a sanitized shape fixture. Its ID, private project identity, prompt, token and raw content were not persisted. `interactions.get` was not called. The original upload/readback Document name was unavailable and was not reconstructed.

## Returned dispatch history

### 0027-CODEX-03 — RETURNED / diagnostic provider failure, citation blocker retained

```text
STARTING_REF: 11865c49b17c578713c3c1b4bc5c2307434d50e9
FINAL_COMMIT: 745e34d8a04df4aaea8a9373775106b4b08b4523
IMPLEMENTATION_COMMIT: NONE
MODEL: gemini-3.7-flash / explicit low / 2048 / Interactions + File Search
DIAGNOSTIC_HTTP: 429 / too_many_requests
DIAGNOSTIC_ATTEMPTS_RETRIES: 2 / 1
DIAGNOSTIC_CUMULATIVE_SLEEP_MS: 514
DIAGNOSTIC_LATENCY_MS: 21825
CITATION_SHAPE: NOT_OBSERVED
TEMP_RESOURCE_CLEANUP: PASS (reported)
MUTABLE_SOURCE_RESTORATION: PASS / 82 of 82 (reported)
IMMUTABLE_VERSION_CREATED: NO
WEB_APP_UPDATE: NO / version 72 unchanged
WORK_ACCEPTANCE: NOT_MET
BLOCKER: GEMINI_3_7_FILE_CITATION_IDENTITY_OR_METADATA_MISMATCH
```

Report: `docs/handoffs/0027-CODEX-03-citation-identity-repair-report.md`.

Controller review: the report discloses a noncompliant temporary invocation-path modification. It was removed and restoration reported; it is not qualification evidence. That route must not be repeated. CODEX-03 budgets expired on return, including the unused version-73/confirmation budget.

### 0027-CODEX-02 — RETURNED / citation identity blocker

```text
IMPLEMENTATION_COMMIT: acd3aa08a3ecc01a7b0852afef8f58202934af82
FINAL_COMMIT: 0032a9cdb69cc1431566dee82f7e2c2196ddee50
LOGIC_VALIDATION: PASS / 440 of 440
BUNDLE_GATES: PASS / 27 of 27
SOURCE_READBACK: PASS / 82 of 82
PRIVATE_WEB_APP_VERSION: 72 / shell PASS
SHORT_INTERACTIONS_3_7: HTTP 200 / 1470ms
FILE_SEARCH_3_7: HTTP 200 / expected token PASS / file_citation 1
QUERY_ATTEMPTS_RETRIES: 2 / 1
QUERY_TOTAL_LATENCY_MS: 34992
AUTHORITATIVE_METADATA_MATCH: FAIL
GEMINI_3_6: NOT_RUN / STOP_DISALLOWED
TEMP_RESOURCE_CLEANUP: PASS
TERMINAL_OUTCOME: BLOCKED_PRODUCT_DEFECT
```

Report: `docs/handoffs/0027-CODEX-02-stable-model-file-search-baseline-report.md`.

### 0027-CODEX-01 — RETURNED / 3.8 transient query failure

```text
IMPLEMENTATION_COMMIT: d0456516cae5e65e68d5789e3e8e5338cffd6823
FINAL_COMMIT: 2c6cd20bfe6a4ef3b6262160b4126266307222dd
LOGIC_VALIDATION: PASS / 431 of 431
PRIVATE_WEB_APP_VERSION: 71 / shell PASS
MODELS_SHORT_INTERACTIONS_UPLOAD_INDEX_READBACK: PASS
FILE_SEARCH_3_8: HTTP 500 / api_error / 68442ms
TEMP_RESOURCE_CLEANUP: PASS
```

Report: `docs/handoffs/0027-CODEX-01-gemini-file-search-resilience-and-e2e-qualification-report.md`.

Work 0026 remains ACCEPTED. CODEX-04 is returned. Any subsequent repair or runtime execution must use CODEX-05 with fresh authorization; all historical source/version/generation budgets remain expired.

WORK_ID: 0027
ACTIVE_DISPATCH_ID: 0027-CODEX-04
BALL: CHATGPT
STATUS: RETURNED
