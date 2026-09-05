# Work 0027 — CODEX-02 stable-model File Search baseline report

WORK_ID: `0027`  
DISPATCH_ID: `0027-CODEX-02`  
BALL: `CHATGPT`
STATUS: `RETURNED`
MODE: `BUILD`

## Outcome

The stable-model qualification-only path is implemented, deterministically validated, delivered, and deployed to the same private Web App as immutable version 72. The runtime campaign used one temporary Store and one synthetic document, then stopped safely on the first disallowed progression condition.

`gemini-3.7-flash / explicit low / max_output_tokens 2048` returned HTTP 200 with the exact expected answer token and one `file_citation`, but that citation did not match the exact authoritative provider document identity plus `source_type`, `source_id`, and `content_hash`. The result is therefore `CITATION_IDENTITY_OR_METADATA_MISMATCH`, not qualification.

The instruction explicitly prohibits progression to 3.6 after a citation identity/metadata mismatch. `gemini-3.6-flash` was not called. Cleanup ran in `finally`; the temporary Store was deleted and deletion was confirmed.

```text
TERMINAL_OUTCOME: BLOCKED_PRODUCT_DEFECT
QUALIFIED_MODEL_ID: NONE
WORK_ACCEPTANCE_BLOCKER: GEMINI_3_7_FILE_CITATION_IDENTITY_OR_METADATA_MISMATCH
READY_FOR_CHATGPT_FINAL_REVIEW: NO
```

## Git and implementation

```text
EXACT_STARTING_REF: 4de21594918e4e2e7a1f76ca2c7a0ce49fe086d3
IMPLEMENTATION_COMMIT: acd3aa0
FINAL_COMMIT: this report/tracking commit; resolve from PR #37 head
BRANCH: agent/0027-gemini-file-search-resilience
PR: #37 / Draft / Open / unmerged
```

The implementation preserves CODEX-01 and adds only the bounded 3.7/conditional-3.6 qualification sequence, exact progression allowlist, exact candidate persistence behavior, retry-disposition telemetry, and no-fallback regression coverage. The CODEX-02 E2E path contains no 3.8 or GenerateContent call.

## Deterministic validation

```text
FOCUSED_TESTS: PASS / 71 of 71
LOGIC_VALIDATION: PASS / 440 of 440
NPM_RUN_CHECK: PASS
NPM_RUN_CHECK_BUNDLE: PASS / 27 of 27
AGENT_FOUNDATION: PASS
TEMPORAL_VALIDATION: PASS / 3 helpers / 173 regression lines / Asia-Tokyo
PUBLIC_SURFACE_VALIDATION: PASS / 30 normal / 3 guarded / 737 private
GIT_DIFF_CHECK: PASS
SECRET_SCAN: PASS
```

The release bundle was built twice and was byte-identical:

```text
BUNDLE_BYTES: 1042332
BUNDLE_GENERATOR_LINES: 17566
BUNDLE_SHA256: d52c2f7a4c15746c615d7a43639e3d982ba1216d150bb860f4c688a600d3ef53
MANIFEST_SHA256: 1116afa33119252e86418ac3f1c5ceb48fb795f8a7524d5c48e6c2307e649fcf
INSTALL_SHA256: a777fea3a253b65d510b7f7aad939964daaac299f21110fea8ce8db321fba812
```

## Source delivery and deployment

```text
SOURCE_DELIVERY: 1
SOURCE_READBACK: PASS / 82 of 82
MISSING_DEPLOYABLE_FILES: 0
EXTRA_DEPLOYABLE_FILES: 0
CONTENT_MISMATCHES: 0
NEW_IMMUTABLE_VERSION: 1 / version 72
SAME_PRIVATE_WEB_APP_UPDATE: 1 / 71 -> 72
VERSION_67_DEPLOYED: NO
VERSION_73_OR_HIGHER_CREATED: NO
```

Authoritative deployment metadata proved one version-71 `WEB_APP` `/exec` entrypoint with `MYSELF` access and `USER_DEPLOYING` execution before mutation. Readback after the single update proved the same entrypoint at version 72 and no remaining version-71 or version-67 Web App deployment.

## Web App shell

Root and Knowledge Search were reloaded before provider-resource mutation.

```text
PRIVATE_WEB_APP_VERSION: 72
ROOT_PAGE_RENDER_AND_BOOTSTRAP: PASS
KNOWLEDGE_PAGE_RENDER_AND_BOOTSTRAP: PASS
LITERAL_INCLUDE_DIRECTIVES: 0
INCLUDED_STYLE_BLOCKS_PRESENT: YES
INCLUDED_CLIENT_SCRIPTS_PRESENT: YES
BLOCKING_BROWSER_CONSOLE_ERRORS: 0
```

## Bounded Gemini runtime evidence

```text
MODEL_VISIBILITY: PASS / gemini-3.7-flash visible
MODELS_LIST_LOGICAL_REQUESTS: 1
TEMP_STORE_CREATE: PASS / exactly 1
TEMP_DOCUMENT_UPLOAD_INDEX_READBACK: PASS / exactly 1 current exact document

CANDIDATE_3_7_SHORT_INTERACTIONS: PASS
CANDIDATE_3_7_SHORT_HTTP: 200
CANDIDATE_3_7_SHORT_ATTEMPT_RETRY: 1 / 0
CANDIDATE_3_7_SHORT_RETRY_DISPOSITION: NOT_APPLICABLE
CANDIDATE_3_7_SHORT_LATENCY_MS: 1470

CANDIDATE_3_7_FILE_SEARCH: FAIL / CITATION_IDENTITY_OR_METADATA_MISMATCH
CANDIDATE_3_7_FILE_SEARCH_HTTP: 200
CANDIDATE_3_7_FILE_SEARCH_ATTEMPT_RETRY: 2 / 1
CANDIDATE_3_7_FILE_SEARCH_CUMULATIVE_SLEEP_MS: 501
CANDIDATE_3_7_FILE_SEARCH_RETRY_DISPOSITION: RETRIED
CANDIDATE_3_7_FILE_SEARCH_LATENCY_MS: 34992
CANDIDATE_3_7_PROGRESSION: STOP_DISALLOWED

CANDIDATE_3_6_SHORT_INTERACTIONS: NOT_RUN
CANDIDATE_3_6_FILE_SEARCH: NOT_RUN
GEMINI_3_8_RERUN: NO
```

Gate results:

```text
ANSWER_TOKEN: PASS
FILE_CITATION: PASS / 1
AUTHORITATIVE_METADATA_MATCH: FAIL
QUALIFIED_MODEL_ID: NONE
TEMP_RESOURCE_DELETE: PASS
TEMP_RESOURCE_DELETION_CONFIRMATION: PASS
```

The runtime evidence is the safe allowlisted Audit representation. No raw response, provider Store/document identity, private URL, credential, prompt, or source content is recorded here.

## Final integrity and side effects

```text
GEMINI_ENABLED: false
NORMAL_USER_GEMINI_VISIBILITY: false
NORMAL_USER_ROUTES: OPENAI and FULL_EXPORT only
NORMAL_USER_AUTOMATIC_MODEL_FALLBACK: NO
EXISTING_GEMINI_STORE_OR_SOURCE_MUTATION: 0
OPENAI_API_CALLS: 0
FULL_OUTPUT_RUNTIME_CALLS: 0
TEMPORARY_PROVIDER_RESOURCES_REMAINING: 0 / deletion confirmed
GITHUB_CI_ACTUALLY_RAN: NO at report time
```

The accepted OpenAI, FULL_OUTPUT, structured-search, bundle, installer, and CODEX-01 behavior remains unchanged. No existing Gemini Store, DOC-000017, MTG-000005, six-format fixture, or large fixture was read for mutation or changed.

## Classification and next boundary

```text
LOGIC_VALIDATION: PASS
TARGET_RUNTIME_QUALIFICATION: FAIL
SIDE_EFFECT_STATE: CLEAN / temporary Store deletion confirmed
READY: NO
BLOCKER: GEMINI_3_7_FILE_CITATION_IDENTITY_OR_METADATA_MISMATCH
```

Any continuation must use a new `0027-CODEX-03` dispatch and remain scoped to the exact Gemini citation identity/metadata mismatch. CODEX-02 does not authorize another model call, Store, deployment, source delivery, or version.

## Shared Knowledge

```text
KNOWLEDGE_RETRIEVAL: RULE-0001, RULE-0002, PAT-0002, PAT-0004, OBS-0018
KNOWLEDGE_APPLIED: RULE-0001, RULE-0002, PAT-0002, PAT-0004, OBS-0018
NEW_KNOWLEDGE_CANDIDATE: YES
```
