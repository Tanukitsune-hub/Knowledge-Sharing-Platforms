# Work 0027 — CODEX-02 stable-model File Search baseline qualification

WORK_ID: `0027`  
DISPATCH_ID: `0027-CODEX-02`  
BALL: `CODEX`  
STATUS: `READY`  
MODE: `BUILD`

## 1. Primary outcome

Preserve the accepted CODEX-01 transport, retry, upload-recovery, cleanup and safe-classification repair, then establish one complete personal-DEV Gemini File Search baseline on a stable supported model.

The required success path is:

```text
personal DEV Google Apps Script
-> one temporary File Search Store
-> one synthetic TXT upload/index/readback
-> Gemini Interactions + File Search
-> expected token
-> file_citation
-> exact synthetic metadata identity
-> cleanup confirmation
```

Model order is bounded and deterministic:

```text
PRIMARY: gemini-3.7-flash / explicit low / max_output_tokens 2048
QUALIFICATION-ONLY FALLBACK: gemini-3.6-flash / explicit low / max_output_tokens 2048
GEMINI_3_8_RERUN: prohibited in CODEX-02
```

The normal product must not perform automatic model fallback. The fallback is permitted only inside this isolated administrator qualification campaign.

Work 0027 is accepted only if one candidate reaches `QUALIFIED_DISABLED`. All other terminal results are safe stops, not successful qualification.

## 2. GitHub authority and starting point

Repository:

`Tanukitsune-hub/Knowledge-Sharing-Platforms`

Branch:

`agent/0027-gemini-file-search-resilience`

PR:

`#37 / Draft / Open / unmerged`

CODEX-01 final head before this handoff:

`2c6cd20bfe6a4ef3b6262160b4126266307222dd`

Execute the current GitHub branch head after confirming it contains this instruction. Do not reset, discard or overwrite newer work.

Read the nearest `AGENTS.md` files and these Work sources before editing:

- `docs/handoffs/0027-dispatches.md`
- `docs/handoffs/0027-instruction.md`
- `docs/handoffs/0027-report.md`
- `docs/handoffs/0027-CODEX-01-gemini-file-search-resilience-and-e2e-qualification-report.md`
- `docs/handoffs/0027-CODEX-02-stable-model-file-search-baseline-instruction.md`
- `docs/handoffs/0027-company-gas-gemini-smoke-evidence.md`
- `docs/decisions/gemini-gas-runtime-evidence-and-transient-resilience.md`
- `docs/planning/work0027-gemini-file-search-resilience-and-qualification.md`
- `docs/planning/work-registry.md`
- `docs/operations/runtime-artifact-locator.md`

## 3. Strategy reset

The user’s primary outcome is not to prove that Gemini 3.8 works. It is to make Gemini File Search work end to end in the personal DEV Apps Script environment before attempting company rollout.

CODEX-01 established that:

```text
MODELS_VISIBILITY: PASS
SHORT_GEMINI_3_8_INTERACTIONS: PASS
TEMP_STORE_CREATE: PASS
SYNTHETIC_UPLOAD_INDEX_READBACK: PASS
FILE_SEARCH_QUERY: HTTP 500 / api_error / PROVIDER_OR_TRANSIENT_FAILURE
TEMP_RESOURCE_CLEANUP: PASS
```

Therefore the cheapest next decisive action is not another 3.8 retry. It is a bounded stable-model control using models that current Google documentation lists as File Search-capable.

Preserve all accepted CODEX-01 evidence. Do not reopen upload/indexing, shell, source delivery, retry contracts or cleanup unless the new exact run materially contradicts them.

## 4. Closed conclusions

The following are accepted and must be preserved:

```text
WORK_0026: ACCEPTED
CODEX_01_IMPLEMENTATION_COMMIT: d0456516cae5e65e68d5789e3e8e5338cffd6823
CODEX_01_FINAL_COMMIT: 2c6cd20bfe6a4ef3b6262160b4126266307222dd
PRIVATE_WEB_APP_VERSION_71_SHELL: PASS
SOURCE_READBACK: PASS / 82 of 82
AUTH_VS_TRANSIENT_CLASSIFICATION: PASS
BOUNDED_RETRY_POLICY: PASS
RESUMABLE_UPLOAD_RECOVERY: PASS
ORDINARY_CONTENT_LENGTH_FORBIDDEN: PASS
REQUIRED_X_GOOG_UPLOAD_LENGTH_PRESERVED: PASS
SYNTHETIC_UPLOAD_INDEX_READBACK: PASS
CODEX_01_TEMP_RESOURCE_CLEANUP: PASS
OPENAI_AND_FULL_OUTPUT: preserved
GEMINI_NORMAL_USER_ROUTE: disabled and hidden
```

The CODEX-01 HTTP 500 is valid evidence for the exact 3.8 File Search query. It does not prove that 3.7 or 3.6 File Search fails.

## 5. Active hypothesis

Hypothesis:

The remaining failure is specific to the 3.8 File Search query path or a transient provider condition affecting that exact request. The shared product upload/index/citation contracts can complete on `gemini-3.7-flash` or, if necessary, `gemini-3.6-flash` without another architectural change.

Confirming observation:

- either 3.7 or 3.6 returns a completed grounded answer containing the unique token and at least one exact `file_citation`.

Falsifying observations:

- both allowed candidates finish the bounded campaign with provider-transient/model-access failures; or
- either candidate exposes a response-shape, application, source-integrity or citation-mapping defect.

Do not introduce a third model, GenerateContent fallback, Store redesign, chunking change or embedding experiment in this Dispatch.

## 6. Required code scope

Preserve the CODEX-01 implementation and make only the changes required to qualify the two allowed stable candidates.

### 6.1 Parameterize the qualification model

Remove Work-0027 qualification-only hardcoding that permits only `gemini-3.8-flash`.

The isolated E2E qualification and safe evidence contracts must correctly support exactly:

```text
gemini-3.7-flash
gemini-3.6-flash
```

The prior 3.8 value may remain readable as historical evidence, but CODEX-02 must not call it.

Parameterize at least:

- model visibility check;
- short Interactions request;
- File Search request;
- safe diagnostic model allowlist;
- stage diagnostics;
- safe E2E evidence;
- model-policy result persistence;
- report/audit model identity.

Do not weaken exact thinking/output requirements:

```text
thinking_level: low
max_output_tokens: 2048 for File Search
```

### 6.2 Qualification-only candidate progression

Use one temporary Store and one temporary synthetic document for the campaign.

Candidate 1: `gemini-3.7-flash`.

Attempt candidate 2, `gemini-3.6-flash`, only when candidate 1 ends with one of:

```text
MODEL_ACCESS_OR_UNSUPPORTED
PROVIDER_OR_TRANSIENT_FAILURE
COMPLETED_NO_GROUNDED_ANSWER
COMPLETED_NO_FILE_CITATION
COMPLETED_EXPECTED_TOKEN_MISMATCH
COMPLETED_FINISH_OR_SAFETY_LIMIT
```

Do not continue to 3.6 after:

```text
AUTHENTICATION_OR_PERMISSION_FAILURE
CITATION_IDENTITY_OR_METADATA_MISMATCH
RESPONSE_SHAPE_OR_APPLICATION_FAILURE
source/document duplication or integrity failure
cleanup uncertainty
```

If 3.7 passes, stop without calling 3.6.

### 6.3 Qualified model persistence

If one candidate passes:

- persist that exact model/thinking/output tuple as the qualified Gemini profile/default candidate;
- retain `GEMINI_ENABLED=false`;
- retain normal-user visibility as hidden pending ChatGPT final review;
- mark any unqualified Gemini candidate as non-default and non-visible;
- do not silently retain 3.8 as the effective qualified model.

No automatic normal-request model fallback may be added.

### 6.4 Retry disposition evidence

The CODEX-01 File Search query recorded attempt 1/retry 0. For each CODEX-02 candidate, record one safe enum explaining the retry outcome when a transient response does not lead to another attempt, for example:

```text
RETRIED
RETRY_AFTER_EXCEEDS_SLEEP_BUDGET
PROVIDER_RESOURCE_IDENTITY_PRESENT
AMBIGUOUS_MUTATING_OUTCOME
ATTEMPT_BUDGET_EXHAUSTED
NOT_RETRYABLE
NOT_APPLICABLE
```

Do not expose raw headers, provider IDs or response bodies.

## 7. Deterministic validation

Add focused tests before target-runtime mutation for:

1. 3.7 PASS stops before 3.6.
2. 3.7 transient failure permits exactly one 3.6 candidate progression.
3. 3.7 model-access failure permits 3.6.
4. 3.7 authentication/permission failure stops before 3.6.
5. 3.7 citation-identity or response-shape defect stops before 3.6.
6. 3.6 PASS persists 3.6 as the exact qualified model while Gemini remains disabled/hidden.
7. both candidates transient -> safe disabled result, not qualification.
8. safe evidence accepts 3.7 and 3.6 but leaks no raw provider material.
9. one temporary Store/document is shared without duplicate upload.
10. cleanup failure overrides all model results.
11. normal Knowledge Search performs no automatic cross-model fallback.
12. retry-disposition telemetry is allowlisted and non-secret.

Then run:

```text
npm run check
npm run check:bundle
python tools/validate_agent_foundation.py
git diff --check
```

Build the bundle twice and prove byte identity. Run the secret scan and inspect the complete diff.

## 8. Source delivery and deployment boundary

Only after deterministic PASS:

```text
SOURCE_DELIVERY: maximum 1
SOURCE_READBACK: every deployable file must match
NEW_IMMUTABLE_VERSION: exactly 1 / expected version 72
SAME_PRIVATE_WEB_APP_UPDATE: exactly 1 / expected 71 -> 72
VERSION_73_OR_HIGHER: prohibited
VERSION_67: never deploy
```

After deployment, verify Root and Knowledge Search before provider-resource mutation:

- zero literal include directives;
- styles and client bootstrap present;
- normal bootstrap complete;
- zero blocking browser console errors.

If shell/readback fails, stop before creating a temporary Store.

## 9. Target-runtime campaign

Use only the isolated personal DEV runtime and one new harmless synthetic token.

Sequence:

1. list models once and confirm the attempted candidate IDs are visible;
2. create one temporary Work-0027 Store;
3. upload/index/read back one tiny synthetic TXT using the production upload path;
4. confirm exactly one current document by exact metadata/content hash;
5. run candidate 3.7 short Interactions validation;
6. run candidate 3.7 Interactions + File Search query;
7. if and only if the progression rules permit, run candidate 3.6 short Interactions validation and File Search query against the same temporary Store/document;
8. require for success:
   - completed response;
   - normalized answer contains the unique token;
   - at least one `file_citation`;
   - exact source/document metadata match;
9. delete the temporary Store/resources in `finally`;
10. confirm deletion/readback;
11. confirm Gemini remains disabled and hidden.

## 10. Runtime and mutation budget

```text
MODELS_LIST: 1 logical request
TEMP_STORE_CREATE: 1 logical request
TEMP_DOCUMENT_UPLOAD: 1 logical upload session
INDEX/READBACK: existing bounded behavior
SHORT_INTERACTIONS_3_7: max 1 logical request plus existing bounded transient retry
FILE_SEARCH_QUERY_3_7: max 1 logical request plus existing bounded transient retry
SHORT_INTERACTIONS_3_6: max 1 logical request plus existing bounded transient retry, conditional
FILE_SEARCH_QUERY_3_6: max 1 logical request plus existing bounded transient retry, conditional
TOTAL_CANDIDATE_MODELS: max 2
TOTAL_PROVIDER_CAMPAIGN_WALL_CLOCK_BEFORE_CLEANUP: max 300 seconds
TEMP_STORE: max 1
TEMP_DOCUMENT: max 1
SOURCE_DELIVERY: max 1
IMMUTABLE_VERSION: exactly 1 / expected 72
WEB_APP_UPDATE: max 1
EXISTING_GEMINI_STORE_OR_SOURCE_MUTATION: 0
OPENAI_API_CALLS: 0
FULL_OUTPUT_RUNTIME_CALLS: 0
```

If the wall-clock budget is reached, stop new model calls and perform cleanup immediately.

## 11. Terminal decision

Allowed safe-stop results:

```text
QUALIFIED_DISABLED
DISABLED_TRANSIENT_PROVIDER_LIMITATION
DISABLED_MODEL_ACCESS_LIMITATION
BLOCKED_PRODUCT_DEFECT
BLOCKED_RESOURCE_CLEANUP
```

Work acceptance rule:

```text
QUALIFIED_DISABLED with qualified_model_id = gemini-3.7-flash or gemini-3.6-flash
-> READY_FOR_CHATGPT_FINAL_REVIEW: YES

all other outcomes
-> WORK_ACCEPTANCE_BLOCKER: PERSONAL_DEV_FILE_SEARCH_E2E_NOT_QUALIFIED or exact product/cleanup blocker
```

A transient-safe stop after both candidates is not a product availability blocker because Gemini remains hidden, but it does not satisfy the user’s personal-DEV qualification objective.

## 12. GitHub delivery

Update at minimum:

- `docs/handoffs/0027-CODEX-02-stable-model-file-search-baseline-report.md`
- `docs/handoffs/0027-dispatches.md`
- `docs/handoffs/0027-instruction.md`
- `docs/handoffs/0027-report.md`
- `docs/planning/work0027-gemini-file-search-resilience-and-qualification.md`
- `docs/planning/work-registry.md`
- `docs/operations/runtime-artifact-locator.md`
- PR #37 body

Commit and push the scoped result. Keep PR #37 Draft/Open/unmerged. Do not merge.

## 13. Mandatory final response

Begin and end with exactly:

```text
WORK_ID: 0027
DISPATCH_ID: 0027-CODEX-02
BALL: CHATGPT
STATUS: RETURNED
```

If a native user action is required to continue the same run, retain this Dispatch ID and return `BALL: USER / STATUS: ACTION_REQUIRED` instead.
