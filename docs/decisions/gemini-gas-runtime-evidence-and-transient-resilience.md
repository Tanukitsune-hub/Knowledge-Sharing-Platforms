# Gemini GAS runtime evidence and transient-resilience decision

Status: ACCEPTED FOR WORK 0027 IMPLEMENTATION  
Decision date: 2026-09-04  
Scope: Gemini Developer API / Google Apps Script / Interactions / File Search

## Decision

Keep Gemini as an optional, fail-closed provider and open a new bounded Work to repair transient-error handling and prove one synthetic File Search end-to-end path.

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
6. File Search Store create/delete works. Upload, indexing, File Search answer, and authoritative citation still require end-to-end qualification.
7. The diagnostic upload failure was caused by manually setting the ordinary `Content-Length` header in `UrlFetchApp`; it did not reach Gemini.
8. Work 0026's `HTTP_OR_CREDENTIAL_FAILURE` remains historical evidence that one product qualification call failed. It is superseded as a general root-cause label by the more specific evidence above.

## Existing product-source finding

Current main already avoids manually setting the ordinary `Content-Length` header during upload finalization. It passes a Blob to `UrlFetchApp` and sets only:

```text
X-Goog-Upload-Header-Content-Length
X-Goog-Upload-Header-Content-Type
X-Goog-Upload-Offset
X-Goog-Upload-Command
```

`X-Goog-Upload-Header-Content-Length` is part of the resumable-upload session metadata and must not be removed merely because the diagnostic tool incorrectly set ordinary `Content-Length`.

Work 0027 must add a regression gate that forbids ordinary `Content-Length` in Apps Script request options while preserving the required `X-Goog-Upload-Header-Content-Length`.

## Transport decision

Interactions remains the primary Gemini generation and File Search transport.

GenerateContent remains a bounded diagnostic/control path only. A model switch or GenerateContent fallback must not become automatic normal-user routing.

## Transient retry policy

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
- preserve retry count, safe HTTP status, safe provider code, stage, and elapsed time;
- never log raw response bodies, credentials, source content, Store/document IDs, private URLs, or authorization headers.

Bounded defaults for Work 0027:

```text
IDEMPOTENT_GET_POLL_DELETE: max 3 total attempts / cumulative sleep <= 20 seconds
INTERACTION_OR_OTHER_MUTATING_CREATE: max 2 total attempts, only after an explicit transient HTTP response with no returned resource identity
AMBIGUOUS_NETWORK_FAILURE_ON_MUTATING_POST: no blind replay
```

For resumable upload finalization, an interrupted request or 5xx must not cause an unconditional full resend. Query the resumable session state, use the server-reported offset/status, or reconcile the expected synthetic document identity before at most one safe resume/finalize attempt.

## Response-validation decision

Transport and content validation are separate:

```text
HTTP_REACHABILITY
JSON_RESPONSE_SHAPE
TEXT_EXTRACTION
NORMALIZED_EXPECTED_TOKEN_MATCH
FINISH_REASON_OR_SAFETY_LIMIT
EMPTY_OR_UNEXPECTED_RESPONSE
```

HTTP 200 must not be relabeled as a connection failure solely because the expected token is absent.

## Qualification decision

Use one non-confidential synthetic document and one temporary File Search Store:

```text
Models visibility
-> short Interactions generation
-> temporary Store create
-> synthetic upload
-> bounded operation polling
-> File Search query through Interactions
-> expected unique token
-> file_citation
-> authoritative synthetic metadata match
-> cleanup in finally
```

The temporary Store and any temporary resource must be deleted on both success and failure. A terminal acceptance result is prohibited until cleanup is confirmed. If cleanup cannot be confirmed, stop as `BLOCKED_RESOURCE_CLEANUP`.

Terminal outcomes:

```text
QUALIFIED_DISABLED
DISABLED_TRANSIENT_PROVIDER_LIMITATION
BLOCKED_PRODUCT_DEFECT
BLOCKED_RESOURCE_CLEANUP
```

A successful qualification does not automatically expose Gemini to normal users; activation is a separate administrator decision after final review.

## Non-goals

- production or confidential indexing;
- broad reindex;
- existing Store/source mutation;
- model sweep or automatic model fallback;
- Azure OpenAI work;
- OpenAI or FULL_OUTPUT live calls;
- company rollout;
- large-file qualification;
- general hardening unrelated to the observed failure modes.
