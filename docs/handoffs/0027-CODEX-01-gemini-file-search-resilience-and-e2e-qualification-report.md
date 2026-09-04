WORK_ID: 0027
DISPATCH_ID: 0027-CODEX-01
BALL: CHATGPT
STATUS: RETURNED

# Work 0027 — CODEX-01 Gemini File Search resilience and E2E qualification report
MODE: `BUILD`

## Outcome

The scoped Gemini transport, retry, resumable-upload recovery and safe-classification repair is implemented and deterministically validated. The exact tested modular source was delivered and read back, Apps Script version 71 was created, and the same private Web App was updated once from version 70 to version 71.

The single authorized synthetic Gemini File Search E2E reached the File Search query after passing model visibility, short Interactions, temporary Store creation, TXT upload/indexing and exact document readback. The query returned an explicit HTTP 500 with allowlisted provider code `api_error` after 68,442ms and was classified `PROVIDER_OR_TRANSIENT_FAILURE`. The temporary Store was then deleted and deletion was confirmed.

The exact terminal outcome is therefore:

```text
TERMINAL_OUTCOME: DISABLED_TRANSIENT_PROVIDER_LIMITATION
GEMINI_ENABLED_FOR_NORMAL_USERS: NO
PRODUCT_DEFECT_OBSERVED: NO
TEMPORARY_RESOURCE_CLEANUP: PASS
WORK_ACCEPTANCE_BLOCKER: NONE
READY_FOR_CHATGPT_FINAL_REVIEW: YES
```

Work 0026 remains accepted. Its historical one-call `HTTP_OR_CREDENTIAL_FAILURE` was not reused as the current root-cause classification.

## Implemented repair

### Failure classification

New runtime observations now keep these boundaries distinct:

```text
AUTHENTICATION_OR_PERMISSION_FAILURE
PROVIDER_OR_TRANSIENT_FAILURE
MODEL_ACCESS_OR_UNSUPPORTED
PROVIDER_TERMINAL_<safe status>
COMPLETED_EMPTY_RESPONSE
COMPLETED_TEXT_EXTRACTION_FAILURE
COMPLETED_EXPECTED_TOKEN_MISMATCH
COMPLETED_FINISH_OR_SAFETY_LIMIT
COMPLETED_NO_GROUNDED_ANSWER
COMPLETED_NO_FILE_CITATION
CITATION_IDENTITY_OR_METADATA_MISMATCH
RESPONSE_SHAPE_OR_APPLICATION_FAILURE
```

The historical coarse Work 0026 value remains readable for compatibility but is not emitted for a new Work 0027 observation.

### Bounded retry policy

```text
TRANSIENT_HTTP_ALLOWLIST: 408, 429, 500, 502, 503, 504
DEFAULT_NON_RETRY_HTTP: 400, 401, 403, 404
IDEMPOTENT_GET_POLL_DELETE: maximum 3 total attempts
MUTATING_CREATE: maximum 2 total attempts
CUMULATIVE_SLEEP_BUDGET: maximum 20,000ms
DELAY_ORDER: valid Retry-After, otherwise exponential backoff plus jitter
AMBIGUOUS_MUTATING_NETWORK_FAILURE: no replay
MUTATING_RESPONSE_WITH_PROVIDER_IDENTITY: no replay
MODEL_OR_PROVIDER_FALLBACK: none
```

Transport attempt, retry count, cumulative sleep and elapsed time are retained as non-enumerable internal metadata and projected only through the safe qualification diagnostic allowlist.

### Resumable upload recovery

- ordinary `Content-Length` is rejected from Apps Script request headers;
- required `X-Goog-Upload-Header-Content-Length` remains on upload-session creation;
- finalize interruption or explicit transient failure queries the same resumable session first;
- only a safe server-reported offset may be resumed, at most once;
- final/terminated state is reconciled against exact `source_type + source_id + content_hash` identity;
- ambiguous state fails closed instead of blindly resending;
- duplicate exact documents remain a product/source-integrity failure.

### Safe telemetry

The existing restricted Audit sheet records only the allowlisted terminal outcome, correlation hash, stage, exact model/transport tuple, HTTP status, allowlisted provider code, response/content/citation booleans, retry counts, elapsed time and cleanup result. Raw provider responses/messages, credentials, authorization headers, prompts, source text, Store/document identities and private URLs are excluded.

## Deterministic validation

The required pre-fix Work 0027 tests were first observed failing deterministically. After the repair:

```text
FOCUSED_GEMINI_TRANSPORT_ADMIN_WORK0027: PASS / 75 of 75
WORK0027_REQUIRED_FAILURE_INJECTION_TESTS: PASS / 11 of 11
NPM_RUN_CHECK: PASS / 431 of 431
NPM_RUN_CHECK_BUNDLE: PASS / 27 of 27
AGENT_FOUNDATION: PASS
TEMPORAL_VALIDATION: PASS
PUBLIC_SURFACE_VALIDATION: PASS / 30 normal, 3 guarded, 728 private functions
GIT_DIFF_CHECK: PASS
BUNDLE_REPRODUCIBILITY: PASS / two consecutive builds byte-identical
BUNDLE_BYTES: 1030634
BUNDLE_LINES: 17310
BUNDLE_SHA256: b32a87c0bc38e33a2408cc13e6ad10cf167b26321c84b469b935500421833fd4
MANIFEST_SHA256: 065ecb99c561daaf9c5116662806320df5da6e1aa4fd07485e321c4465f39c04
INSTALL_SHA256: a9090490618913c05487450ed1ed772252449196d80329a377c96f0d69cdfa68
SECRET_SCAN: PASS
```

Focused coverage includes all transient/permanent HTTP classes, Retry-After precedence, attempt and cumulative-sleep limits, ambiguous mutating POST suppression, ordinary Content-Length rejection, required resumable header preservation, session query/resume/reconciliation, response/content/citation classification, safe telemetry redaction and all four terminal E2E outcomes.

## Source delivery and deployment

The exact tested source was pushed once. A fresh pull into an isolated temporary directory was normalized only for Apps Script `.js`/repository `.gs` filename and line-ending differences, then compared file by file.

```text
SOURCE_DELIVERY: 1
SOURCE_READBACK: PASS / 82 of 82
MISSING_DEPLOYABLE_FILES: 0
EXTRA_DEPLOYABLE_FILES: 0
CONTENT_MISMATCHES: 0
NEW_IMMUTABLE_VERSION: 1 / version 71
SAME_PRIVATE_WEB_APP_UPDATE: 1 / 70 -> 71
VERSION_70_DEPLOYMENTS_AFTER_UPDATE: 0
VERSION_71_DEPLOYMENTS_AFTER_UPDATE: 1
VERSION_67_DEPLOYED: NO
VERSION_72_OR_HIGHER_CREATED: NO
VERSION_72_OR_HIGHER_DEPLOYED: NO
```

## Version 71 shell smoke

The deployed page was reloaded after the version update before any provider-resource mutation.

```text
ROOT_PAGE_RENDER_AND_BOOTSTRAP: PASS
KNOWLEDGE_PAGE_RENDER_AND_BOOTSTRAP: PASS
LITERAL_INCLUDE_DIRECTIVES: 0
EXPECTED_STYLE_RESOURCE: PRESENT
CLIENT_BOOTSTRAP_SOURCE: PRESENT
SERVER_CALL_BOOTSTRAP_SOURCE: PRESENT
NORMAL_BOOTSTRAP_COMPLETION: PASS
KNOWLEDGE_ROUTE_AND_MODEL_SELECTOR: PRESENT
BLOCKING_BROWSER_CONSOLE_ERRORS: 0
```

## Single bounded Gemini E2E

Exactly one private-administrator qualification action ran with:

```text
MODEL: gemini-3.8-flash
THINKING: explicit low
MAX_OUTPUT_TOKENS: 2048
TRANSPORT: Interactions + File Search
EXISTING_STORE_OR_SOURCE_MUTATION: NO
MODEL_FALLBACK: NO
CROSS_PROVIDER_FALLBACK: NO
```

Safe stage evidence from the restricted Audit record:

| Stage | Result | Safe evidence |
| --- | --- | --- |
| Models visibility | PASS | HTTP 200; model visible; attempt 1; retry 0; 130ms |
| Short Interactions | PASS | HTTP 200; response shape/text/token PASS; attempt 1; retry 0; 8,541ms |
| Temporary Store create | PASS | HTTP 200; one temporary Store; attempt 1; retry 0 |
| TXT upload/index/readback | PASS | HTTP 200; exact metadata/hash readback; exactly one current document |
| File Search query | FAIL | HTTP 500; `api_error`; `PROVIDER_OR_TRANSIENT_FAILURE`; attempt 1; retry 0; cumulative sleep 0; 68,442ms |
| Temporary Store delete | PASS | HTTP 200; attempt 1; retry 0 |
| Cleanup confirmation | PASS | provider readback confirmed deletion |

The HTTP 500 was an explicit provider response, not authentication, permission, response-shape, parser, citation-identity or local upload failure. The bounded policy did not authorize a blind second mutating create attempt. No second E2E, model fallback, GenerateContent control or OpenAI call was run.

Because the File Search query did not complete, expected-token and file-citation acceptance are correctly `NOT ACHIEVED`; they were not mislabeled as passed. Earlier upload/index/readback evidence remains valid for what it observed.

## Cleanup and source integrity

```text
TEMPORARY_STORE_CREATED: YES / exactly 1
TEMPORARY_DOCUMENT_VERIFIED: YES / exactly 1 current document
EXACT_CURRENT_DOCUMENT_COUNT: 1 / no duplicate
CLEANUP_REQUIRED: YES
CLEANUP_ATTEMPTED: YES
TEMPORARY_STORE_DELETE: PASS
CLEANUP_CONFIRMATION: PASS
TEMPORARY_RESOURCE_REMAINS: NO
EXISTING_GEMINI_STORES_MUTATED: NO
DOC_000017_MUTATED: NO
MTG_000005_MUTATED: NO
SIX_FORMAT_FIXTURES_MUTATED: NO
CONFIDENTIAL_OR_PRODUCTION_DATA_USED: NO
```

## Side-effect and final integrity

```text
PRIVATE_WEB_APP_VERSION: 71
GEMINI_READINESS: DISABLED_TRANSIENT_PROVIDER_LIMITATION
GEMINI_ENABLED: false
NORMAL_USER_GEMINI_ROUTE_VISIBLE: NO
OPENAI_API_CALLED: NO
FULL_OUTPUT_RUNTIME_CALLED: NO
BROAD_SYNC_OR_REINDEX: NO
EXISTING_PROVIDER_RESOURCE_MUTATION: NO
UNAUTHORIZED_DEPLOYMENT: NO
CONFIDENTIAL_DATA_USED: NO
```

## Files changed

Implementation and tests:

- `src/130_AiConstants.gs`
- `src/160_AiEnvironment.gs`
- `src/161_GeminiRestClient.gs`
- `src/165_AiProviderAdmin.gs`
- `tests/ai-gemini-resilience.test.cjs`
- `tests/ai-gemini-transport.test.cjs`
- `tests/ai-provider-admin.test.cjs`
- generated `dist/KnowledgeShare.bundle.gs`
- generated `dist/release-manifest.json`
- generated `dist/INSTALL.md`

Tracking and delivery:

- this report
- `docs/handoffs/0027-report.md`
- `docs/handoffs/0027-dispatches.md`
- `docs/handoffs/0027-instruction.md`
- `docs/planning/work0027-gemini-file-search-resilience-and-qualification.md`
- `docs/planning/work-registry.md`
- `docs/operations/runtime-artifact-locator.md`
- PR #37 body

## Completion latch

```text
WORK_0026_ACCEPTED_EVIDENCE_PRESERVED: PASS
AUTH_VS_TRANSIENT_CLASSIFICATION: PASS
BOUNDED_RETRY_POLICY: PASS
RESUMABLE_UPLOAD_RECOVERY: PASS
GENERATE_CONTENT_DIAGNOSTIC_SEPARATION: PASS
SAFE_TELEMETRY: PASS
LOGIC_VALIDATION: PASS / 431 of 431
SOURCE_DELIVERY_READBACK: PASS / 82 of 82
APPS_SCRIPT_VERSION: 71
WEB_APP_UPDATE: PASS / same private deployment, exactly once
WEB_APP_SHELL: PASS
SYNTHETIC_UPLOAD_INDEX_READBACK: PASS
FILE_SEARCH_GROUNDED_QUERY_AND_CITATION: NOT ACHIEVED / explicit HTTP 500 provider response
TEMPORARY_RESOURCE_CLEANUP: PASS
TERMINAL_OUTCOME: DISABLED_TRANSIENT_PROVIDER_LIMITATION
PRODUCT_AVAILABILITY_BLOCKER: NONE / Gemini remains disabled and OpenAI/FULL_OUTPUT remain available
WORK_ACCEPTANCE_BLOCKER: NONE
GITHUB_CI_ACTUALLY_RAN: NO
READY_FOR_CHATGPT_FINAL_REVIEW: YES
IMPLEMENTATION_COMMIT: d0456516cae5e65e68d5789e3e8e5338cffd6823
FINAL_COMMIT: this tracking commit; exact SHA is reported in PR #37 and the final return
PR: #37 / Draft / Open / unmerged
```

## Shared Knowledge

KNOWLEDGE_RETRIEVAL: RULE-0001, RULE-0002, PAT-0002, PAT-0004
KNOWLEDGE_APPLIED: RULE-0001, RULE-0002, PAT-0002, PAT-0004
NEW_KNOWLEDGE_CANDIDATE: YES

WORK_ID: 0027
DISPATCH_ID: 0027-CODEX-01
BALL: CHATGPT
STATUS: RETURNED
