# Work 0027 — CODEX-05 strict citation resolver report

WORK_ID: 0027
DISPATCH_ID: 0027-CODEX-05
BALL: CHATGPT
STATUS: RETURNED
MODE: BUILD

## Outcome

The shared strict Gemini citation resolver is implemented, deterministically validated, delivered, and deployed to the same private personal-DEV Web App as immutable version 73. One guarded `gemini-3.7-flash / explicit low / max_output_tokens 2048 / Interactions + File Search` campaign completed with the expected grounded token, a real file citation, exact current synthetic source/document binding, qualification/normal-mapper parity, and confirmed temporary-resource deletion.

The exact tuple is persisted as the Gemini default candidate, but Gemini remains disabled and hidden from normal users. No existing Gemini Store or business source was modified.

```text
TERMINAL_OUTCOME: QUALIFIED_DISABLED
IMPLEMENTATION: PASS
LOGIC_VALIDATION: PASS
TARGET_RUNTIME_QUALIFICATION: PASS
TEMP_RESOURCE_CLEANUP: PASS
WORK_ACCEPTANCE: MET
READY: YES / for ChatGPT final review
BLOCKER: NONE
```

## Git and implementation

```text
MAIN_AT_EXECUTION: 8c9be2392a1247ff81efc6a153fc0be449b1318b
EXACT_STARTING_REF: aa55bbac75a3b97c58df513d2c0465a2c7fde505
IMPLEMENTATION_COMMIT: 40905f23d8c6bab5b76e7fb2f34f96b912aeb2f7
FINAL_COMMIT: this report/tracking commit; resolve from PR #37 head and final return
BRANCH: agent/0027-gemini-file-search-resilience
PR: #37 / Draft / Open / unmerged
```

Changed implementation artifacts:

- `src/132_AiKnowledgeContracts.gs`
- `src/150_KnowledgeSearchModels.gs`
- `src/161_GeminiRestClient.gs`
- `src/164_AiProviderCore.gs`
- `src/165_AiProviderAdmin.gs`
- five directly related existing tests plus `tests/ai-gemini-citation-resolver.test.cjs`
- reproducibly generated `dist/KnowledgeShare.bundle.gs`, manifest, and install guide

The resolver keeps `document_uri` separate from content-valued `source`, accepts object or supported array custom metadata without hiding conflicts, validates every annotation before deduplication, and uses one strict path for qualification plus normal immediate/POLL completion. It requires the trusted Store, exact `source_type`/`source_id`/`content_hash`, one Active authoritative source with its current Gemini hash, one independently verified current provider document, and any stored Gemini document reference to agree. It never uses filename, answer token, request filter, singleton Store, or excerpt hash as identity. OpenAI mapping is unchanged.

## Deterministic validation

The recovered CODEX-04 fixture first reproduced the old content-source-versus-provider-document equality failure. The repaired fixture then resolved three equivalent annotations to one authoritative citation; all required negative cases failed closed.

```text
PREFIX_RECOVERED_SHAPE_REPRODUCTION: PASS / old normalizer fails deterministically
DEDICATED_STRICT_RESOLVER_TESTS: PASS / 8 of 8
FOCUSED_TESTS: PASS / 111 of 111
LOGIC_VALIDATION: PASS / 448 of 448
NPM_RUN_CHECK: PASS
NPM_RUN_CHECK_BUNDLE: PASS / 27 of 27
AGENT_FOUNDATION: PASS
TEMPORAL_VALIDATION: PASS / 3 helpers / 173 regression lines / Asia-Tokyo
PUBLIC_SURFACE_VALIDATION: PASS / 30 normal / 3 guarded / 743 private
BUNDLE_REPRODUCIBILITY: PASS / two builds byte-identical
GIT_DIFF_CHECK: PASS
SECRET_SCAN: PASS
```

```text
BUNDLE_BYTES: 1072244
BUNDLE_LINES: 18173
BUNDLE_SHA256: c1b1496ac32c54c21255a38b9ea957809ceffdd473d5bf6781b2450c1d2bf6a2
MANIFEST_SHA256: 21abb02b32ac5cddcb3c91b0b0ed367589ce47f0ae8b352c28d57e2587770684
INSTALL_SHA256: 2585720205d33cc665333ec9682633f5d6c491f2aa99c2c4af277e75a8031ea5
```

Meeting and Pitchbook parity, wrong/foreign Store, missing/conflicting/wrong identity keys, stale/inactive source, missing/ambiguous provider document, same-filename/token rescue, OpenAI-only state, conflicting duplicate annotations, diagnostic redaction, and immediate/POLL parity are covered by focused tests.

## Source delivery and deployment

The exact tested modular source was delivered once and pulled into one disposable readback directory.

```text
SOURCE_DELIVERY: 1
SOURCE_READBACK: PASS / 82 of 82
MISSING_DEPLOYABLE_FILES: 0
EXTRA_DEPLOYABLE_FILES: 0
CONTENT_MISMATCHES: 0
NEW_IMMUTABLE_VERSION: 1 / version 73
SAME_PRIVATE_WEB_APP_UPDATE: 1 / 72 -> 73
VERSION_67_DEPLOYED: NO
VERSION_74_OR_HIGHER_CREATED: NO
```

Private deployment identity was reconciled before mutation: exact repository source, existing personal-DEV Script project, immutable version 72, same `WEB_APP` `/exec`, `USER_DEPLOYING`, `MYSELF`, intended signed-in administrator, and guarded administrator page. Post-update readback proved the same deployment at version 73.

## Web App shell

```text
PRIVATE_WEB_APP_VERSION: 73
ROOT_PAGE_RENDER_AND_BOOTSTRAP: PASS
KNOWLEDGE_PAGE_RENDER_AND_BOOTSTRAP: PASS
LITERAL_INCLUDE_DIRECTIVES: 0
INCLUDED_STYLES_AND_CLIENT_BOOTSTRAP: PRESENT
APPLICATION_BLOCKING_CONSOLE_ERRORS: 0
```

One console error was attributable to the browser-control extension rather than the Web App. It is external tooling evidence and did not block application bootstrap or provider qualification.

## Quota preflight and one bounded campaign

The same personal-DEV Gemini project was inspected without an API/model probe. It was on the Free tier with 3.7 limits of 5 RPM, 250K TPM, and 20 RPD and had viable headroom. One permitted post-run page refresh showed `1/5 RPM`, `200/250K TPM`, and `1/20 RPD`, consistent with the single bounded generation request.

```text
MODELS_VISIBILITY_PROBE: NOT_RUN / accepted CODEX-02 evidence only
SHORT_INTERACTIONS_PROBE: NOT_RUN / accepted CODEX-02 evidence only
MODEL: gemini-3.7-flash
THINKING: explicit low
MAX_OUTPUT_TOKENS: 2048
TRANSPORT: INTERACTIONS + FILE_SEARCH
LOGICAL_FILE_SEARCH_QUERIES: 1
TEMP_STORES_CREATED: 1
TEMP_DOCUMENTS_CREATED: 1 tiny synthetic TXT
TEMP_DOCUMENT_INDEX_AND_READBACK: PASS
CURRENT_EXACT_PROVIDER_DOCUMENT_COUNT: 1
EXPECTED_GROUNDED_TOKEN: PASS
REAL_FILE_CITATION: PASS / at least 1
AUTHORITATIVE_NORMALIZED_CITATIONS: PASS / exactly 1
NORMAL_IMMEDIATE_POLL_MAPPING_PARITY: PASS
APPS_SCRIPT_GUARDED_ACTION_DURATION_MS: 25554
BROWSER_ACTION_TO_RESULT_MS: approximately 32234
```

The returned safe per-request diagnostic was consumed by the normal administrator client and was not durably retained. Therefore the exact response-embedded HTTP status, attempt/retry counters, query-only latency, returned source category, and exact raw citation count are `NOT_RETAINED`; they are not invented here. The successful `QUALIFIED_DISABLED` code path nevertheless requires a valid HTTP/response shape, answer/token, at least one genuine citation, exact Store and all three metadata matches, Active/current authoritative source, unique independent provider-document readback, stored-reference agreement, exactly one resolved citation with no warning, normal-mapper parity, and confirmed cleanup. The post-run quota count independently records one request.

Safe gate evidence:

```text
DOCUMENT_URI_TRUSTED_STORE_MATCH: PASS / terminal invariant
METADATA_SOURCE_TYPE_MATCH: PASS / terminal invariant
METADATA_SOURCE_ID_MATCH: PASS / terminal invariant
METADATA_CONTENT_HASH_MATCH: PASS / terminal invariant
AUTHORITATIVE_SOURCE_ACTIVE_MATCH: PASS / terminal invariant
CURRENT_GEMINI_HASH_MATCH: PASS / terminal invariant
PROVIDER_DOCUMENT_UNIQUE_MATCH: PASS / exact count 1
PROVIDER_DOCUMENT_READBACK_MATCH: PASS
STORED_DOCUMENT_REFERENCE_MATCH: PASS
CONFLICTING_OR_AMBIGUOUS_IDENTITY: NONE ACCEPTED
```

The optional safe Audit append was not observed in the restricted Audit sheet, and no raw/private value leaked there. This is a non-blocking evidence-retention follow-up; it is not used as qualification evidence and does not change the guarded action's persisted qualified/disabled state.

## Cleanup, persistence, and final integrity

Cleanup ran in `finally`. The temporary Store deletion and absence confirmation were required before the action could return `QUALIFIED_DISABLED`.

```text
TEMP_RESOURCE_DELETE: PASS
TEMP_RESOURCE_DELETION_CONFIRMATION: PASS
TEMPORARY_PROVIDER_RESOURCES_REMAINING: 0
QUALIFIED_MODEL_ID: gemini-3.7-flash
QUALIFIED_THINKING_PROFILE: low
GEMINI_READINESS: QUALIFIED_DISABLED
GEMINI_ENABLED: false
NORMAL_USER_GEMINI_VISIBILITY: false
NORMAL_USER_ROUTES: ChatGPT/OpenAI and FULL_OUTPUT only
NORMAL_USER_AUTOMATIC_MODEL_FALLBACK: NO
EXISTING_GEMINI_STORE_OR_BUSINESS_SOURCE_MUTATION: 0
OPENAI_CALLS: 0
FULL_OUTPUT_LIVE_CALLS: 0
OTHER_GEMINI_MODEL_OR_TRANSPORT_CALLS: 0
GITHUB_CI_ACTUALLY_RAN: NO at implementation-report preparation time
```

The normal-user Knowledge Search selector was read back after qualification and contained no Gemini option. The administrator panel showed Gemini as qualified but disabled, with 3.7/low qualified. Existing Stores, DOC-000017, MTG-000005, and other business or fixture sources were not changed.

## Classification

```text
IMPLEMENTATION: PASS
LOGIC_VALIDATION: PASS
TARGET_RUNTIME_QUALIFICATION: PASS
CLEANUP: PASS
SIDE_EFFECT_STATE: CLEAN / intended version-policy updates only
READY: YES / ChatGPT final review
BLOCKER: NONE
FIX_SOON: persist the already-sanitized qualification evidence when Audit is configured
FOLLOW_UP: company quota/credentials/permissions, representative large files, migration, rollout
```

## Shared Knowledge

```text
KNOWLEDGE_RETRIEVAL: RULE-0001, RULE-0002, PAT-0002, PAT-0004
KNOWLEDGE_APPLIED: RULE-0001, RULE-0002, PAT-0004
NEW_KNOWLEDGE_CANDIDATE: YES
```

WORK_ID: 0027
DISPATCH_ID: 0027-CODEX-05
BALL: CHATGPT
STATUS: RETURNED
