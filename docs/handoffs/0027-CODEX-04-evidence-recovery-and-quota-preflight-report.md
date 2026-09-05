# Work 0027 — CODEX-04 evidence recovery and quota preflight report

WORK_ID: 0027
DISPATCH_ID: 0027-CODEX-04
BALL: CHATGPT
STATUS: RETURNED
MODE: INVESTIGATION

## Outcome

The exact CODEX-02 successful Gemini 3.7 File Search Interaction was recovered read-only from the same AI Studio project. Its retained correlation identity matched the safe CODEX-02 result, so no account-history enumeration or guessed Interaction selection was used. The response was inspected in place; it was not downloaded, copied, exported or committed.

The decisive citation shape is now known. Gemini returned `source` as source-content text rather than a provider Document resource identity. It returned `document_uri` as the requested File Search Store identity, not a Document identity. Exact `source_type`, `source_id` and `content_hash` were present in `custom_metadata`. The current qualification matcher instead requires `citation.source === documentValue.name`, so the observed content-valued `source` caused the aggregate mismatch.

```text
TERMINAL_OUTCOME: EVIDENCE_RECOVERED
WORK_ACCEPTANCE: NOT_MET
WORK_ACCEPTANCE_BLOCKER: GEMINI_3_7_FILE_CITATION_IDENTITY_OR_METADATA_MISMATCH
PRODUCT_REPAIR_IN_CODEX_04: NONE / not authorized
TARGET_RUNTIME_QUALIFICATION: NOT_RUN
GEMINI_ENABLED: false / preserved
NORMAL_USER_GEMINI_VISIBILITY: false / preserved
```

## Recovered retained evidence

Evidence provenance was limited to the known CODEX-02 execution window and the exact synthetic correlation. The retained safe result established the final correlation, model, HTTP 200 result, expected-token success, one normalized citation, one verified temporary document and cleanup. The matching AI Studio log then exposed the stored response shape.

```text
EXACT_STORED_INTERACTION_AVAILABLE: YES
SAME_PROJECT_MATCH_CONFIRMED: YES / retained correlation matched the exact stored row
MODEL: gemini-3.7-flash
STATUS: completed / HTTP 200
INTERACTION_ID_PRESENT: YES / value not persisted or reported
INTERACTIONS_GET_API_ATTEMPTS: 0 / stored response was already visible
RAW_RESPONSE_EXPORT_OR_COPY: 0
ORIGINAL_UPLOAD_READBACK_DOCUMENT_NAME: UNAVAILABLE
ORIGINAL_UPLOAD_READBACK_SAFE_STATE: one exact document verified / retained CODEX-02 evidence
```

The raw provider response contained three equivalent `file_citation` annotations. The existing parser deduplicated them by `source_id`, which explains the previously reported normalized count of one. The sanitized, relationship-preserving fixture is `docs/handoffs/0027-CODEX-04-sanitized-citation-shape.json`.

| Field or relation | Recovered observation |
|---|---|
| `source` | `CONTENT_TEXT`; not a provider resource identity |
| `document_uri` | `STORE`; exactly equal to the requested Store |
| provider Document identity in response | Absent |
| `file_name` | Present; not used as authoritative identity |
| `custom_metadata.source_type` | Present and equal to the exact request filter |
| `custom_metadata.source_id` | Present and equal to the exact request filter |
| `custom_metadata.content_hash` | Present; equals SHA-256 of the returned source content after removal of one provider-added terminal newline |
| raw / unique annotations | 3 / 1 exact tuple after deduplication |

The exact original upload/readback Document resource value was not retained and is not reconstructed. That absence does not prevent identifying the matcher defect: the recovered `source` value is content text, while the sole non-metadata qualification condition requires it to equal the verified Document resource name. No filename-only, token-only, filter-only or singleton-Store inference is accepted.

## Same-project quota preflight

AI Studio was inspected once under the same project proven by the recovered Interaction correlation. No model, Models, embedding, Store or provider probe was made.

```text
OBSERVED_AT: 2026-09-05 11:05 JST
PROJECT_IDENTITY_REPORTED: NO / redacted
TIER: Free
MODEL: gemini-3.7-flash
LAST_HOUR_RPM: 3 / 5
LAST_HOUR_TPM: 394 / 250000
LAST_HOUR_RPD: 3 / 20
LAST_28_DAYS_PEAK_RPM: 6 / 5
LAST_28_DAYS_PEAK_TPM: 1080 / 250000
LAST_28_DAYS_PEAK_RPD: 12 / 20
```

The 28-day view proves a historical RPM exceedance and displayed a rate-limit-reached warning. The last-hour view at observation time showed RPM, TPM and RPD below their limits. It therefore establishes current visible headroom but does not identify the exact quota dimension behind CODEX-03's earlier 429. The retained safe error had no allowlisted `Retry-After`, `retryDelay`, quota metric or reset timestamp.

```text
CODEX_03_429_QUOTA_CATEGORY: UNKNOWN
CURRENT_VISIBLE_LIMITING_RISK: RPM / lowest relative headroom
EXPLICIT_WAIT_OR_RESET_EVIDENCE: UNKNOWN
RPD_RESET_RELEVANCE: NONE / RPD was not exhausted
```

## Compliant future invocation route

The deployed version-72 private Web App provides the compliant route:

`AI provider settings -> 接続・File Search確認 -> mutateAiProviderSettings({action: "QUALIFY_MODEL_PROFILE", ...}) -> kspMutateAiProviderSettings_ -> kspIsAiProviderAdministrator_ -> private qualification helper`.

Read-only Web App observation showed `管理者操作が利用できます。`; after the guarded admin-data call completed, the normal controls including `接続・File Search確認` were enabled. The button was not clicked. This route preserves the administrator latch and requires no editor-visible private helper, installer interception, temporary handler branch, deployment-owner substitution or authorization bypass.

```text
COMPLIANT_INVOCATION_ROUTE: AVAILABLE
CURRENT_ADMIN_LATCH: PASS / read-only facade evidence
QUALIFICATION_ACTION_INVOKED: NO
EXECUTION_PATH_BLOCKED: NO
FUTURE_PREREQUISITE: new CODEX-05 authorization for repair, deployment and one bounded qualification campaign
```

## Cheapest next decisive action

Authorize CODEX-05 to implement one evidence-led resolver repair and its deterministic fixture tests: preserve `source` as content, treat `document_uri` only as exact Store-binding evidence, resolve `custom_metadata.source_type + source_id + content_hash` against exactly one current Active provider document in that configured Store, deduplicate equivalent annotations, and fail closed on missing, conflicting, stale or ambiguous identity. Use the same strict resolver for qualification and normal Gemini mapping; never accept filename alone.

Only after deterministic PASS and a fresh quota-headroom check should CODEX-05 use the existing guarded Web App route for one bounded 3.7/low/2048 confirmation with safe shape capture before cleanup.

## Zero-mutation and validation record

```text
NEW_GENERATION_OR_MODELS_CALLS: 0
INTERACTION_GET_HTTP_CALLS: 0
NEW_OR_MODIFIED_STORES: 0
UPLOADS_OR_PROVIDER_DOCUMENT_MUTATIONS: 0
PROVIDER_SETTINGS_MUTATIONS: 0
OPENAI_CALLS: 0
FULL_OUTPUT_LIVE_CALLS: 0
APPS_SCRIPT_SOURCE_STAGING_OR_DELIVERY: 0
IMMUTABLE_VERSIONS_CREATED: 0
WEB_APP_DEPLOYMENTS_UPDATED: 0
BILLING_KEY_SECURITY_OR_PERMISSION_CHANGES: 0
SRC_TESTS_DIST_CHANGES: 0
DEPLOYED_VERSION: 72 / unchanged
VERSION_67: unused
```

Fresh validation for this evidence-only dispatch is limited to sanitized JSON parsing, agent-foundation/document governance, privacy/diff hygiene and Git state. Product logic tests and bundle gates were not rerun; their CODEX-02 440/440 and 27/27 results remain historical evidence only.

```text
SANITIZED_JSON_VALIDATION: PASS
AGENT_FOUNDATION_VALIDATION: PASS
PRIVACY_SCAN: PASS
GIT_DIFF_CHECK: PASS / line-ending conversion warnings only
SRC_TESTS_DIST_UNCHANGED: PASS
PRODUCT_LOGIC_TESTS: NOT_RUN / no product change
BUNDLE_GATES: NOT_RUN / no bundle change
```

## GitHub delivery

```text
EXACT_STARTING_REF: 9dad26cec30580050f371284a5ad8d2f2cc8b3d2
BRANCH: agent/0027-gemini-file-search-resilience
PR: #37 / Draft / Open / unmerged
IMPLEMENTATION_COMMIT: NONE
FINAL_COMMIT: resolve from final return / PR head
GITHUB_CI_ACTUALLY_RAN: NO at pre-delivery inspection
READY: NO
BLOCKER: GEMINI_3_7_FILE_CITATION_IDENTITY_OR_METADATA_MISMATCH
```

## Shared Knowledge

KNOWLEDGE_RETRIEVAL: RULE-0001, PAT-0002
KNOWLEDGE_APPLIED: RULE-0001, PAT-0002
NEW_KNOWLEDGE_CANDIDATE: YES

WORK_ID: 0027
DISPATCH_ID: 0027-CODEX-04
BALL: CHATGPT
STATUS: RETURNED
