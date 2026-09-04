# Work 0027 dispatch control

WORK_ID: `0027`  
ACTIVE_DISPATCH_ID: `0027-CODEX-02`  
BALL: `CODEX`  
STATUS: `READY`

## Active dispatch

### 0027-CODEX-02 — stable-model File Search baseline qualification

Primary outcome:

```text
preserve CODEX-01 resilience/upload repair
-> parameterize the qualification model
-> test gemini-3.7-flash first
-> conditionally test gemini-3.6-flash
-> achieve one personal-DEV grounded answer + exact file_citation
-> cleanup and keep Gemini hidden pending review
```

Detailed instruction:

`docs/handoffs/0027-CODEX-02-stable-model-file-search-baseline-instruction.md`

Report:

`docs/handoffs/0027-CODEX-02-stable-model-file-search-baseline-report.md`

## Dispatch history

### 0027-CODEX-01 — RETURNED / 3.8 query transient after upload/index success

```text
IMPLEMENTATION_COMMIT: d0456516cae5e65e68d5789e3e8e5338cffd6823
FINAL_COMMIT: 2c6cd20bfe6a4ef3b6262160b4126266307222dd
LOGIC_VALIDATION: PASS / 431 of 431
PRIVATE_WEB_APP_VERSION: 71 / shell PASS
MODELS_VISIBILITY: PASS
SHORT_GEMINI_3_8_INTERACTIONS: PASS
TEMP_STORE_CREATE: PASS
SYNTHETIC_UPLOAD_INDEX_READBACK: PASS
FILE_SEARCH_QUERY: HTTP 500 / api_error / PROVIDER_OR_TRANSIENT_FAILURE / 68,442ms
TEMPORARY_RESOURCE_CLEANUP: PASS
GEMINI_ROUTE: disabled and hidden
OPENAI_API_CALLS: 0
FULL_OUTPUT_RUNTIME_CALLS: 0
```

CODEX-01 successfully removed the previously suspected upload/network blockers. It did not establish a grounded File Search answer or citation on 3.8.

Report:

`docs/handoffs/0027-CODEX-01-gemini-file-search-resilience-and-e2e-qualification-report.md`

## Strategy reset

The user’s completion target is a working personal-DEV File Search path, not use of the newest model. Current official and runtime evidence permits a bounded stable-model control.

```text
PRIMARY_CANDIDATE: gemini-3.7-flash / low / 2048
QUALIFICATION_ONLY_FALLBACK: gemini-3.6-flash / low / 2048
GEMINI_3_8_RERUN: prohibited
NORMAL_USER_AUTOMATIC_MODEL_FALLBACK: prohibited
```

CODEX-02 may use one shared temporary Store/document and at most two candidate models. If 3.7 passes, 3.6 must not be called.

## CODEX-02 bounds

```text
SOURCE_DELIVERY: max 1
IMMUTABLE_VERSION: exactly 1 / expected 72
SAME_WEB_APP_UPDATE: max 1 / expected 71 -> 72
VERSION_73_OR_HIGHER: prohibited
TEMP_STORE: max 1
TEMP_DOCUMENT: max 1
CANDIDATE_MODELS: max 2
EXISTING_STORE_SOURCE_MUTATION: prohibited
OPENAI_API: 0
FULL_OUTPUT_LIVE: 0
CAMPAIGN_WALL_CLOCK_BEFORE_CLEANUP: max 300 seconds
```

Any new Codex execution after CODEX-02 returns must use `0027-CODEX-03`. A user-assisted continuation inside the same active run retains `0027-CODEX-02`.
