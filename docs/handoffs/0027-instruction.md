# Work 0027 instruction

WORK_ID: `0027`  
DISPATCH_ID: `0027-CODEX-02`  
BALL: `CHATGPT`
STATUS: `RETURNED`
MODE: `BUILD`

## Primary outcome

Make Gemini File Search complete end to end in the isolated personal DEV Apps Script runtime on one stable supported model before company-environment qualification.

Model novelty is not an acceptance requirement. The bounded candidate order is:

```text
1. gemini-3.7-flash / explicit low / 2048
2. gemini-3.6-flash / explicit low / 2048, only when CODEX-02 progression rules permit
```

A successful candidate remains disabled and hidden until ChatGPT final review.

## Sources of truth

- root and nearest `AGENTS.md`
- `docs/handoffs/0027-dispatches.md`
- `docs/handoffs/0027-CODEX-01-gemini-file-search-resilience-and-e2e-qualification-report.md`
- `docs/handoffs/0027-CODEX-02-stable-model-file-search-baseline-instruction.md`
- `docs/handoffs/0027-company-gas-gemini-smoke-evidence.md`
- `docs/decisions/gemini-gas-runtime-evidence-and-transient-resilience.md`
- `docs/planning/work0027-gemini-file-search-resilience-and-qualification.md`
- current GitHub main/branch/PR state

## Accepted CODEX-01 evidence

```text
AUTH_VS_TRANSIENT_CLASSIFICATION: PASS
BOUNDED_RETRY_POLICY: PASS
RESUMABLE_UPLOAD_RECOVERY: PASS
ORDINARY_CONTENT_LENGTH_REJECTION: PASS
SOURCE_DELIVERY_READBACK: PASS / 82 of 82
PRIVATE_WEB_APP_VERSION_71: shell PASS
MODELS_VISIBILITY: PASS
SHORT_GEMINI_3_8_INTERACTIONS: PASS
TEMP_STORE_CREATE: PASS
SYNTHETIC_UPLOAD_INDEX_READBACK: PASS / exactly one current document
FILE_SEARCH_QUERY_3_8: HTTP 500 / api_error / provider transient
TEMP_RESOURCE_CLEANUP: PASS
OPENAI_AND_FULL_OUTPUT: preserved
```

Do not redo CODEX-01 work except where model parameterization requires a small reviewed change.

## Strategy reset

The 3.8 result is not sufficient to close the user’s objective because the user explicitly accepts an older stable model and requires a personal-DEV success before company testing.

CODEX-02 must test 3.7 and conditionally 3.6 under the exact detailed instruction. It must not rerun 3.8 or add normal-user automatic fallback.

## CODEX-02 observed result

```text
LOGIC_VALIDATION: PASS / 440 of 440
PRIVATE_WEB_APP_VERSION: 72 / shell PASS
SOURCE_READBACK: PASS / 82 of 82
GEMINI_3_7_SHORT_INTERACTIONS: PASS / HTTP 200
GEMINI_3_7_FILE_SEARCH_ANSWER_TOKEN: PASS
GEMINI_3_7_FILE_CITATION: PASS / 1
GEMINI_3_7_AUTHORITATIVE_METADATA_MATCH: FAIL
GEMINI_3_6: NOT_RUN / citation mismatch is a progression stop
TEMP_RESOURCE_CLEANUP: PASS
TERMINAL_OUTCOME: BLOCKED_PRODUCT_DEFECT
```

CODEX-02 is complete as a bounded dispatch but did not meet Work acceptance. A continuation requires a new `0027-CODEX-03` instruction scoped to `GEMINI_3_7_FILE_CITATION_IDENTITY_OR_METADATA_MISMATCH`; no CODEX-02 call or deployment budget remains.

## Completion condition

The desired completion condition is:

```text
QUALIFIED_DISABLED
QUALIFIED_MODEL_ID: gemini-3.7-flash or gemini-3.6-flash
ANSWER_EXPECTED_TOKEN: PASS
FILE_CITATION: PASS
AUTHORITATIVE_METADATA_MATCH: PASS
TEMP_RESOURCE_CLEANUP: PASS
GEMINI_NORMAL_USER_ROUTE: disabled and hidden
```

A non-qualification terminal result leaves:

```text
WORK_ACCEPTANCE_BLOCKER: GEMINI_3_7_FILE_CITATION_IDENTITY_OR_METADATA_MISMATCH
```

Follow the detailed CODEX-02 budgets and return contract. Keep PR #37 Draft/Open/unmerged.
