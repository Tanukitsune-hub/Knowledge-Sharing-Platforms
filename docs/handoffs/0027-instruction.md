# Work 0027 instruction

WORK_ID: `0027`  
DISPATCH_ID: `0027-CODEX-02`  
BALL: `CODEX`  
STATUS: `READY`  
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

A safe provider/model limitation after both candidates is a valid stop but leaves:

```text
WORK_ACCEPTANCE_BLOCKER: PERSONAL_DEV_FILE_SEARCH_E2E_NOT_QUALIFIED
```

Follow the detailed CODEX-02 budgets and return contract. Keep PR #37 Draft/Open/unmerged.
