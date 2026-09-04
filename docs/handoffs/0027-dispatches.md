# Work 0027 dispatch control

WORK_ID: 0027
ACTIVE_DISPATCH_ID: 0027-CODEX-03
BALL: CODEX
STATUS: READY

## Current dispatch

`0027-CODEX-03` — evidence-led Gemini 3.7 citation identity repair.

Instruction: `docs/handoffs/0027-CODEX-03-citation-identity-repair-instruction.md`
Report: `docs/handoffs/0027-CODEX-03-citation-identity-repair-report.md`

Scope: establish the actual mismatching citation field, fix only the observed normalization/source-resolution gap in shared qualification and normal Gemini mapping, then confirm the repaired 3.7 path in personal DEV. No further model campaign.

```text
MODEL: gemini-3.7-flash / low / 2048
CURRENT_RUNTIME: version 72 / CODEX-02 shell PASS
WORK_ACCEPTANCE_BLOCKER: GEMINI_3_7_FILE_CITATION_IDENTITY_OR_METADATA_MISMATCH
CODEX_03_IMPLEMENTATION_OR_RUNTIME_EVIDENCE: NOT_RUN
GEMINI: disabled / hidden
```

## CODEX-03 bounds

The detailed instruction is authoritative. At most one optional diagnostic query and one post-fix confirmation, <=4 generation HTTP attempts under existing retry safeguards. At most two temporary Stores sequentially, one tiny document each, one active Store at a time. Diagnostic source staging <=1 without deployment; final source delivery <=1. New immutable version <=1, expected 73; same Web App update <=1. Never deploy 67 or create 74+. No Models/short-generation/3.6/3.8/GenerateContent/OpenAI/FULL_OUTPUT calls. Existing sources and Stores remain untouched. Cleanup must be confirmed.

## Returned dispatch history

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

Work 0026 remains ACCEPTED. Preserve CODEX-01/02 evidence for what was observed; neither returned dispatch authorizes additional calls or versions. Only CODEX-03 is active. After it returns, any further instruction requires CODEX-04. A user-native action within the running CODEX-03 retains CODEX-03.

WORK_ID: 0027
ACTIVE_DISPATCH_ID: 0027-CODEX-03
BALL: CODEX
STATUS: READY
