# Work 0027 report

WORK_ID: `0027`  
ACTIVE_DISPATCH_ID: `0027-CODEX-02`  
BALL: `CODEX`  
STATUS: `READY`

## Current state

CODEX-01’s implementation is accepted as the current branch baseline, but Work 0027 is not yet complete against the user’s revised outcome.

```text
LOGIC_VALIDATION: PASS / 431 of 431
PRIVATE_WEB_APP_VERSION: 71 / shell PASS
GEMINI_MODELS_VISIBILITY: PASS
SHORT_GEMINI_3_8_INTERACTIONS: PASS
TEMP_STORE_CREATE: PASS
SYNTHETIC_UPLOAD_INDEX_READBACK: PASS
FILE_SEARCH_QUERY_3_8: HTTP 500 / api_error / PROVIDER_OR_TRANSIENT_FAILURE
TEMP_RESOURCE_CLEANUP: PASS
GEMINI_NORMAL_USER_ROUTE: disabled and hidden
```

The result proves that upload, indexing and exact document readback are no longer the blocker. It does not prove that stable older Gemini models fail File Search.

## ChatGPT review of CODEX-01

GitHub PR #37, exact head `2c6cd20bfe6a4ef3b6262160b4126266307222dd`, implementation commit, final report, changed source/tests, review threads and CI state were independently checked.

```text
CODEX_01_SCOPE_IMPLEMENTED: PASS
SOURCE_AND_RUNTIME_EVIDENCE: CONSISTENT
TEMP_RESOURCE_CLEANUP: PASS
REVIEW_THREADS: 0
GITHUB_CI: absent / non-blocking by itself
PRODUCT_AVAILABILITY_BLOCKER: NONE / Gemini remains hidden
```

The CODEX-01 `DISABLED_TRANSIENT_PROVIDER_LIMITATION` result is valid for the exact 3.8 campaign. PR #37 is not merged because the user’s stated completion target is now a successful personal-DEV File Search path on any suitable stable model.

## Strategy reset and active dispatch

```text
ACTIVE_DISPATCH: 0027-CODEX-02
PRIMARY_CANDIDATE: gemini-3.7-flash / low / 2048
QUALIFICATION_ONLY_FALLBACK: gemini-3.6-flash / low / 2048
GEMINI_3_8_RERUN: NO
NORMAL_USER_AUTOMATIC_MODEL_FALLBACK: NO
ONE_SHARED_TEMP_STORE_AND_DOCUMENT: required
```

Detailed instruction:

`docs/handoffs/0027-CODEX-02-stable-model-file-search-baseline-instruction.md`

## Current blockers

```text
PRODUCT_AVAILABILITY_BLOCKER: NONE
WORK_ACCEPTANCE_BLOCKER: PERSONAL_DEV_FILE_SEARCH_E2E_NOT_QUALIFIED
```

Work acceptance requires a completed answer containing the synthetic token, at least one exact `file_citation`, authoritative metadata match, cleanup confirmation and a persisted exact qualified model of 3.7 or 3.6 while Gemini remains disabled/hidden pending final review.

WORK_ID: `0027`  
ACTIVE_DISPATCH_ID: `0027-CODEX-02`  
BALL: `CODEX`  
STATUS: `READY`
