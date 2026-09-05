# Gemini GAS runtime evidence and transient-resilience decision

Status: ACCEPTED FOR WORK 0027 IMPLEMENTATION  
Decision date: 2026-09-04  
Scope: Gemini Developer API / Google Apps Script / Interactions / File Search

## Decision

Keep Gemini as an optional, fail-closed provider and use bounded target-runtime qualification to establish one working personal-DEV File Search baseline.

This decision supersedes the broad causal inference that the company GAS environment, API key, or target model was generally unavailable. It does not reopen or invalidate Work 0026's accepted safety outcome.

Authoritative implementation Work:

`docs/planning/work0027-gemini-file-search-resilience-and-qualification.md`

Recorded external evidence:

`docs/handoffs/0027-company-gas-gemini-smoke-evidence.md`

## Evidence provenance

The following evidence was supplied by the user from an independent diagnostic Apps Script. The diagnostic was intentionally separate from Knowledge Sharing Platforms and did not use confidential data.

```text
ENVIRONMENT: company Google Apps Script
CONTROL_MODEL: gemini-3.6-flash
TARGET_MODEL: gemini-3.8-flash

LIST_MODELS: HTTP 200 / both models visible
GENERATE_CONTENT_RUN_1: HTTP 200 for both models / fixed-token content check failed
GENERATE_CONTENT_RUN_2: HTTP 503 UNAVAILABLE for both models / high-demand provider response
INTERACTIONS_3_8_RUN_1: HTTP 200 / expected token present / about 52.9 seconds
INTERACTIONS_3_8_RUN_2: HTTP 200 / expected token present / about 37.4 seconds
TEMP_STORE_CREATE: HTTP 200
SYNTHETIC_UPLOAD: client-side GAS rejection before HTTP / invalid ordinary Content-Length header
TEMP_STORE_DELETE: HTTP 200
```

## Corrected conclusions

1. Company GAS can reach the Gemini API. Models, GenerateContent, Interactions, and File Search Store endpoints returned HTTP 200.
2. The tested API key and basic authentication are valid. The evidence does not support a general credential or company-network rejection.
3. `gemini-3.8-flash` is visible and Interactions succeeded twice. Model access or model-name failure is not the current primary hypothesis.
4. The observed HTTP 503 `UNAVAILABLE` responses are provider/transient capacity failures for those requests, not evidence of invalid authentication or input.
5. GenerateContent HTTP 200 with a failed fixed-token assertion is a content-validation failure, not an API-connectivity failure.
6. File Search Store create/delete works. Upload, indexing, File Search answer, and authoritative citation require separate evidence.
7. The diagnostic upload failure was caused by manually setting the ordinary `Content-Length` header in `UrlFetchApp`; it did not reach Gemini.
8. Work 0026's `HTTP_OR_CREDENTIAL_FAILURE` remains historical evidence that one product qualification call failed. It is superseded as a general root-cause label by the more specific evidence above.

## Product upload finding

Knowledge Share does not manually set the ordinary `Content-Length` header during upload finalization. It passes a Blob to `UrlFetchApp` and uses only the resumable-protocol headers:

```text
X-Goog-Upload-Header-Content-Length
X-Goog-Upload-Header-Content-Type
X-Goog-Upload-Offset
X-Goog-Upload-Command
```

`X-Goog-Upload-Header-Content-Length` is required upload-session metadata and must not be removed merely because the independent diagnostic incorrectly set ordinary `Content-Length`.

## Transport decision

Interactions remains the primary Gemini generation and File Search transport.

GenerateContent remains a bounded diagnostic/control path only. No automatic transport fallback is permitted in normal user requests.

## Transient retry decision

Retry only explicit transient failures:

```text
408
429
500
502
503
504
```

Do not automatically retry:

```text
400
401
403
404
```

Required behavior:

- honor `Retry-After` when valid;
- otherwise use exponential backoff with jitter;
- apply a fixed maximum attempt count and cumulative sleep budget;
- preserve retry count, safe HTTP status, safe provider code, stage and elapsed time;
- never log raw response bodies, credentials, source content, Store/document IDs, private URLs or authorization headers.

Bounded defaults:

```text
IDEMPOTENT_GET_POLL_DELETE: max 3 total attempts / cumulative sleep <= 20 seconds
INTERACTION_OR_OTHER_MUTATING_CREATE: max 2 total attempts, only after explicit transient HTTP with no returned resource identity
AMBIGUOUS_NETWORK_FAILURE_ON_MUTATING_POST: no blind replay
```

For resumable upload finalization, an interrupted request or 5xx must not cause an unconditional full resend. Query the same resumable session, use the server-reported offset/status or reconcile exact document identity before at most one safe resume/finalize attempt.

## Response-validation decision

Transport and content validation remain separate:

```text
HTTP_REACHABILITY
JSON_RESPONSE_SHAPE
TEXT_EXTRACTION
NORMALIZED_EXPECTED_TOKEN_MATCH
FINISH_REASON_OR_SAFETY_LIMIT
EMPTY_OR_UNEXPECTED_RESPONSE
FILE_CITATION
AUTHORITATIVE_METADATA_MATCH
```

HTTP 200 must not be relabeled as a connection failure solely because the expected token is absent.

## CODEX-01 result

CODEX-01 implemented the transient classification, bounded retry and resumable-upload repair and then executed one isolated `gemini-3.8-flash` campaign.

```text
MODELS_VISIBILITY: PASS
SHORT_GEMINI_3_8_INTERACTIONS: PASS
TEMP_STORE_CREATE: PASS
SYNTHETIC_UPLOAD_INDEX_READBACK: PASS
FILE_SEARCH_QUERY: HTTP 500 / api_error / PROVIDER_OR_TRANSIENT_FAILURE / 68,442ms
TEMP_STORE_DELETE_AND_CONFIRMATION: PASS
PRIVATE_WEB_APP_VERSION: 71 / shell PASS
```

This proves the product can upload, index and read back an exact Gemini File Search document. It does not establish a grounded answer or citation and does not prove that all File Search-capable models fail.

## Post-CODEX-01 strategy reset

The user explicitly prioritizes a working personal-DEV path over use of the newest model. Therefore Work 0027 continues through one additional bounded Dispatch rather than accepting the 3.8-only transient result as the final outcome.

Qualification candidate order:

```text
PRIMARY: gemini-3.7-flash / explicit low / 2048
QUALIFICATION-ONLY FALLBACK: gemini-3.6-flash / explicit low / 2048
GEMINI_3_8_RERUN: prohibited
```

The fallback is limited to the isolated qualification campaign. Normal Knowledge Search must never silently switch models or providers.

Use one shared temporary Store and one synthetic document. Stop after the first exact PASS. Proceed from 3.7 to 3.6 only after a model-specific, provider-transient or bounded content-limitation result. Do not proceed after authentication/permission failure, citation identity mismatch, response-shape/application failure, source-integrity failure or cleanup uncertainty.

A passing candidate is persisted as the exact qualified Gemini default profile, but Gemini remains disabled and hidden pending ChatGPT final review.

## Acceptance decision

Work 0027 succeeds only when the personal DEV runtime observes:

```text
QUALIFIED_MODEL_ID: gemini-3.7-flash or gemini-3.6-flash
INTERACTIONS: completed
EXPECTED_TOKEN: present
FILE_CITATION: present
AUTHORITATIVE_METADATA_MATCH: PASS
TEMP_RESOURCE_CLEANUP: PASS
GEMINI_ENABLED: false pending review
```

If both candidates stop on provider/model limitations, the product remains safely usable without Gemini but Work 0027 retains `PERSONAL_DEV_FILE_SEARCH_E2E_NOT_QUALIFIED` rather than claiming success.

## Non-goals

- production or confidential indexing;
- broad reindex;
- existing Store/source mutation;
- more than the two named stable candidates;
- 3.8 rerun in CODEX-02;
- automatic normal-user model/provider fallback;
- Store sharding, chunking or embedding experiments;
- Azure OpenAI work;
- OpenAI or FULL_OUTPUT live calls;
- company rollout;
- large-file qualification;
- general hardening unrelated to the observed failure modes.
