# Work 0027 report

WORK_ID: `0027`  
ACTIVE_DISPATCH_ID: `0027-CODEX-02`  
BALL: `CHATGPT`
STATUS: `RETURNED`

## Current state

CODEX-01’s implementation remains accepted. CODEX-02 added the bounded stable-model qualification path and passed all deterministic gates, but target-runtime qualification stopped on an authoritative citation identity/metadata mismatch.

```text
IMPLEMENTATION_COMMIT: acd3aa0
LOGIC_VALIDATION: PASS / 440 of 440
SOURCE_READBACK: PASS / 82 of 82
PRIVATE_WEB_APP_VERSION: 72 / shell PASS
GEMINI_3_8_RERUN: NO
GEMINI_3_7_VISIBILITY: PASS
SHORT_GEMINI_3_7_INTERACTIONS: PASS / HTTP 200
TEMP_STORE_CREATE: PASS
SYNTHETIC_UPLOAD_INDEX_READBACK: PASS / exactly one document
FILE_SEARCH_QUERY_3_7: HTTP 200 / expected token PASS / file_citation 1
AUTHORITATIVE_METADATA_MATCH: FAIL
GEMINI_3_6: NOT_RUN / STOP_DISALLOWED
TEMP_RESOURCE_CLEANUP: PASS
GEMINI_NORMAL_USER_ROUTE: disabled and hidden
TERMINAL_OUTCOME: BLOCKED_PRODUCT_DEFECT
```

The result proves the 3.7 model, answer, and citation-return path are operational. It does not establish an authoritative normalized source because the returned citation did not match the exact provider document and metadata identity.

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

## CODEX-02 bounded result

```text
PRIMARY_CANDIDATE: gemini-3.7-flash / low / 2048
QUALIFICATION_ONLY_FALLBACK: gemini-3.6-flash / low / 2048
GEMINI_3_8_RERUN: NO
NORMAL_USER_AUTOMATIC_MODEL_FALLBACK: NO
ONE_SHARED_TEMP_STORE_AND_DOCUMENT: PASS
ANSWER_EXPECTED_TOKEN: PASS
FILE_CITATION: PASS / 1
AUTHORITATIVE_METADATA_MATCH: FAIL
QUALIFIED_MODEL_ID: NONE
TEMP_RESOURCE_DELETION_CONFIRMATION: PASS
```

Detailed instruction:

`docs/handoffs/0027-CODEX-02-stable-model-file-search-baseline-instruction.md`

## Current blockers

```text
PRODUCT_AVAILABILITY_BLOCKER: NONE
WORK_ACCEPTANCE_BLOCKER: GEMINI_3_7_FILE_CITATION_IDENTITY_OR_METADATA_MISMATCH
```

Gemini remains disabled and absent from the normal-user route, so the optional provider defect does not reduce accepted OpenAI/FULL_OUTPUT availability. Any continuation must use a new CODEX-03 dispatch and must not replay this campaign by default.

WORK_ID: `0027`  
ACTIVE_DISPATCH_ID: `0027-CODEX-02`  
BALL: `CHATGPT`
STATUS: `RETURNED`
