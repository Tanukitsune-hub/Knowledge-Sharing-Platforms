# Work 0026 — CODEX-03 Gemini failure classification and bounded requalification

WORK_ID: `0026`
DISPATCH_ID: `0026-CODEX-03`
BALL: `CODEX`
STATUS: `READY`
MODE: `QUALIFICATION / DIAGNOSTIC REPAIR`

## 1. Primary outcome

Correct the failure-classification gap found in ChatGPT's independent review of CODEX-02, then perform one tightly bounded target-runtime requalification that ends with an evidence-supported terminal state.

This remains Work 0026 because the deliverable is unchanged: either qualify one exact Gemini File Search tuple or leave Gemini safely disabled with the exact external limitation recorded. Do not restart a general provider experiment campaign.

## 2. Authoritative starting state

Repository:

`Tanukitsune-hub/Knowledge-Sharing-Platforms`

Branch:

`agent/0026-gemini-current-api-requalification`

PR:

`#36 / Draft / Open / unmerged`

CODEX-02 returned head reviewed by ChatGPT:

`36d748828e9fd16368266e09d095426126586d06`

Execute the current GitHub PR head after independently verifying that it contains this review instruction. GitHub is the source of truth. Do not reset or discard newer work.

Read first:

- nearest `AGENTS.md` files;
- `docs/handoffs/0026-dispatches.md`;
- `docs/handoffs/0026-instruction.md`;
- `docs/handoffs/0026-CODEX-02-runtime-template-repair-and-gemini-qualification-report.md`;
- this instruction;
- `docs/planning/work0026-gemini-current-api-requalification.md`;
- `docs/planning/work-registry.md`;
- `docs/operations/runtime-artifact-locator.md`.

## 3. Closed conclusions and accepted evidence

Do not reopen these unless new contradictory target-runtime evidence appears:

```text
PRIVATE_WEB_APP_VERSION_69_SHELL: PASS
ROOT_PAGE_RENDER_AND_BOOTSTRAP: PASS
KNOWLEDGE_PAGE_RENDER_AND_BOOTSTRAP: PASS
LITERAL_INCLUDE_DIRECTIVES: 0
BLOCKING_BROWSER_CONSOLE_ERRORS: 0
SOURCE_DELIVERY_READBACK: PASS / 82 of 82 deployable files
DOC-000017_EXACT_GEMINI_DOCUMENT: 1 / active / metadata-matching
MTG-000005_EXACT_GEMINI_DOCUMENT: 1 / active / metadata-matching
GEMINI_DOCUMENT_DUPLICATES: 0
OPENAI_ACCEPTED_PATH: PRESERVED
OPENAI_API_CALLED_IN_CODEX_02: NO
FULL_OUTPUT_LIVE_CALLED_IN_CODEX_02: NO
LOGIC_VALIDATION_AT_CODEX_02: PASS / 410 of 410
BUNDLE_PARITY_AT_CODEX_02: PASS
VERSION_67: unused / never deploy
```

The product remains usable through OpenAI and API-independent FULL_OUTPUT. Gemini is disabled and hidden. The current blocker is to accepting/merging Work 0026, not to normal product availability.

## 4. ChatGPT review finding

CODEX-02 proved that the exact `gemini-3.8-flash / low / 2048` qualification did not satisfy the required grounded-answer and authoritative-citation gate. It did not prove why.

The current implementation can fail for materially different reasons, including:

- HTTP/model/access/quota/provider error;
- Interaction terminal status such as `failed` or `incomplete`;
- completed response with no expected grounded answer;
- completed response with no `file_citation`;
- citation present but metadata/authoritative mapping mismatch;
- response-shape or application-parser defect.

However, the administrator catch path currently writes `DISABLED_EXTERNAL_LIMITATION` for any non-access Gemini qualification exception and then replaces the underlying error with generic `AI_MODEL_QUALIFICATION_FAILED`. The Interactions transport preserves only a coarse terminal status and does not retain the safe Interaction `errors[].code` evidence for review.

Therefore:

```text
BLOCKER: GEMINI_EXTERNAL_LIMITATION_CLASSIFICATION_NOT_EVIDENCED
```

Do not treat CODEX-02's generic failure as proof of an external limitation.

## 5. Current official-documentation ambiguity

Reconfirm the official Google documentation at execution time.

At ChatGPT review on 2026-09-04:

- the Gemini 3.8 Flash model page identified `gemini-3.8-flash` as stable and File Search capable;
- the File Search documentation listed Gemini 3.8 Flash as supported;
- the current Interactions API reference model enumeration did not yet list Gemini 3.8 Flash while listing earlier Flash models.

This documentation mismatch is material evidence of possible rollout/schema lag, but it is not by itself proof that the runtime failure was model unsupported. Record the current state without broad research or model sweeping.

Official references:

- `https://ai.google.dev/gemini-api/docs/models/gemini-3.8-flash`
- `https://ai.google.dev/gemini-api/docs/file-search`
- `https://ai.google.dev/api/interactions-api-v1`

## 6. Required implementation repair

Make the smallest coherent source change that preserves fail-closed behavior and exposes only safe, decision-relevant diagnostics.

### 6.1 Distinguish failure layers

The exact tuple qualification must distinguish at least:

```text
PASS
HTTP_OR_CREDENTIAL_FAILURE
MODEL_ACCESS_OR_UNSUPPORTED
PROVIDER_TERMINAL_<safe status>
COMPLETED_NO_GROUNDED_ANSWER
COMPLETED_NO_FILE_CITATION
CITATION_IDENTITY_OR_METADATA_MISMATCH
RESPONSE_SHAPE_OR_APPLICATION_FAILURE
```

Names may follow existing repository conventions, but distinct causes must not collapse into one generic code before classification.

### 6.2 Preserve safe evidence only

Safe diagnostic evidence may include:

- HTTP status;
- Interaction status;
- allowlisted provider error code(s);
- answer-present boolean;
- expected-token-present boolean;
- model-output block count;
- file-citation count;
- authoritative-citation mapping result;
- latency.

Never expose or persist:

- API key values;
- Store/document/interaction resource names or IDs;
- raw provider response bodies;
- source body text;
- provider error messages that may contain sensitive values;
- private URLs.

### 6.3 Correct readiness classification

`DISABLED_EXTERNAL_LIMITATION` may be written only when the safe evidence identifies a provider/account/model/transport/quota/terminal/citation limitation and no application/source-integrity defect explains the result.

An unknown, response-shape, parser, citation-mapping, or other application-level failure must remain disabled/hidden but use an existing safe error/review-required state rather than being relabeled external. Prefer an existing `ERROR`/failed state unless a new state is strictly required.

### 6.4 Tests

Add deterministic tests proving:

1. the successful exact tuple still qualifies;
2. explicit model unsupported/access evidence remains distinguishable and opens only the authorized fallback condition;
3. provider terminal status and safe provider error code survive to classification without raw identifiers/messages;
4. completed-no-answer, completed-no-citation, and citation-mismatch are distinct;
5. generic/application failures do not write `DISABLED_EXTERNAL_LIMITATION`;
6. external classification is written only for an explicitly qualifying evidence class;
7. Gemini remains hidden for every failed/unqualified state;
8. no OpenAI or automatic cross-provider fallback occurs.

Do not weaken existing assertions to obtain a pass.

## 7. Deterministic predeployment gates

Before any runtime mutation:

```text
focused Work 0026 tests: PASS
npm run check:bundle: PASS
npm run check: PASS
python tools/validate_agent_foundation.py: PASS
git diff --check: PASS
bundle reproducibility: PASS / two clean builds byte-identical
```

Review the final relevant diff before deployment. No unrelated refactor, dependency change, cleanup, or hardening.

## 8. Runtime mutation and provider-call budget

This Dispatch authorizes exactly:

```text
APPS_SCRIPT_SOURCE_DELIVERY: max 1
NEW_IMMUTABLE_VERSION: max 1 / expected version 70
SAME_PRIVATE_WEB_APP_UPDATE: max 1 / expected 69 -> 70
DEPLOY_VERSION_67: prohibited
CREATE_VERSION_71_OR_HIGHER: prohibited
NEW_WEB_APP_OR_SCRIPT_PROJECT: prohibited
GEMINI_STORE_CREATE: 0
GEMINI_SOURCE_UPLOAD_OR_SYNC: 0 unless readback proves CODEX-02 evidence materially stale; if stale, STOP rather than broad reconcile
GEMINI_QUERY_CALLS_TOTAL: max 2
OPENAI_API_CALLS: 0
FULL_OUTPUT_RUNTIME_CALLS: 0
```

Use the same positively identified private Apps Script project and Web App. Perform exact source readback before versioning.

## 9. Version 70 shell smoke

Immediately after the single update, recheck root and Knowledge Search:

```text
ROOT_PAGE_RENDER_AND_BOOTSTRAP: PASS
KNOWLEDGE_PAGE_RENDER_AND_BOOTSTRAP: PASS
LITERAL_INCLUDE_DIRECTIVES: 0
EXPECTED_STYLES_AND_CLIENT_BOOTSTRAP: PRESENT
BLOCKING_BROWSER_CONSOLE_ERRORS: 0
NORMAL_NON_AI_READ_ONLY_FACADE: PASS
```

If shell smoke fails, stop before all provider calls. Do not create version 71.

## 10. Read-only source/provider preflight

Before the query campaign, safely confirm without sync or upload:

```text
GEMINI_KEY: present
CONFIGURED_STORE: accessible
DOC-000017: exactly one active exact-metadata document
MTG-000005: exactly one active exact-metadata document
DUPLICATES: 0
FAILED_PROFILE: retained and not user-selectable
NORMAL_USER_GEMINI_ROUTE: hidden
```

If this closed evidence no longer holds, stop with the exact product/source-integrity blocker. Do not broad-sync.

## 11. Bounded provider decision tree

### Call 1 — required

Run exactly one current Interactions + File Search qualification using:

```text
MODEL: gemini-3.8-flash
THINKING: explicit low
MAX_OUTPUT_TOKENS: 2048
STORE: existing configured Store
SOURCE: DOC-000017 only
FILTER: exact source_type + source_id
```

Record only the safe diagnostic classification described above.

### Call 2 — optional and mutually exclusive

At most one second Gemini query is allowed:

A. If Call 1 produces explicit model-access/model-unsupported evidence, run one `gemini-3.7-flash / low / 2048` Interactions qualification. Do not run GenerateContent.

B. If Call 1 is non-model-specific provider-terminal or completes without the required grounded answer/citation, run one `gemini-3.8-flash / low / 2048` GenerateContent + File Search control solely to distinguish an Interactions-specific limitation from general File Search/grounding failure. Do not run 3.7.

C. For response-shape/application/source-integrity failure, do not make a second provider call. Return the exact product blocker.

No other model, transport, Store, filter, prompt, embedding, chunking, retry, or timeout experiment is allowed.

## 12. Terminal outcomes

### A. `QUALIFIED`

Use only when the exact selected tuple returns the expected grounded answer and exactly one authoritative citation, and the normal user route can be enabled safely.

### B. `DISABLED_EXTERNAL_LIMITATION`

Use only when safe evidence identifies the exact external layer, for example:

- explicit model access/unsupported;
- provider/account/quota/rate/internal error code;
- provider terminal status with safe error classification;
- Interactions-specific failure while the single GenerateContent control proves general File Search works;
- general File Search/grounding/citation failure reproduced by the allowed control with deterministic application parsing intact.

Record the exact evidence class. Keep Gemini disabled/hidden.

### C. Product blocker

Return a product blocker for response-shape, parser, citation normalization/mapping, source identity, security, shell, or other application defect. Do not relabel it external.

Do not create `0026-CODEX-04` yourself.

## 13. GitHub delivery

Update:

- `docs/handoffs/0026-CODEX-03-gemini-failure-classification-and-bounded-requalification-report.md`;
- `docs/handoffs/0026-dispatches.md`;
- `docs/handoffs/0026-report.md`;
- `docs/handoffs/0026-instruction.md`;
- `docs/planning/work0026-gemini-current-api-requalification.md`;
- `docs/planning/work-registry.md` if the terminal status changes;
- `docs/operations/runtime-artifact-locator.md`;
- relevant decision documentation only when the evidence changes a decision;
- deterministic `dist/` artifacts for source changes;
- PR #36 body.

Keep PR #36 Draft/Open/unmerged. Commit and push all scoped changes. Do not merge.

## 14. Completion latch

```text
FAILURE_CLASSIFICATION_REPAIR: PASS | FAIL
UNKNOWN_FAILURE_RELABELLED_EXTERNAL: NO | YES
SAFE_DIAGNOSTIC_TEST_MATRIX: PASS | FAIL
PREDEPLOY_LOGIC_VALIDATION: PASS | FAIL
SOURCE_DELIVERY_READBACK: PASS | FAIL | NOT_RUN
RUNTIME_DEPLOYMENT_VERSION: 70 | unchanged | other
WEB_APP_SHELL: PASS | FAIL | NOT_RUN
GEMINI_KEY_AND_STORE: PASS | FAIL | NOT_RUN
DOC-000017_EXACT_DOCUMENT: 1 | other | NOT_RUN
MTG-000005_EXACT_DOCUMENT: 1 | other | NOT_RUN
GEMINI_QUERY_CALLS: 0 | 1 | 2
PRIMARY_3_8_INTERACTIONS_CLASS: <safe class | NOT_RUN>
SECOND_CONTROL: 3_7_INTERACTIONS | 3_8_GENERATE_CONTENT | NOT_USED
SECOND_CONTROL_CLASS: <safe class | NOT_RUN>
EXACT_EXTERNAL_LIMITATION: <safe class | NONE>
GEMINI_OPTIONAL_PROVIDER_STATUS: QUALIFIED | DISABLED_EXTERNAL_LIMITATION | BLOCKED_PRODUCT_DEFECT
NORMAL_USER_GEMINI_ROUTE_VISIBLE: YES | NO
NO_CROSS_PROVIDER_FALLBACK: PASS | FAIL
OPENAI_ACCEPTED_PATH_PRESERVED: PASS | FAIL
OPENAI_API_CALLED: NO
FULL_OUTPUT_RUNTIME_CALLED: NO
GEMINI_DOCUMENT_DUPLICATES: 0 | other | NOT_RUN
VERSION_67_DEPLOYED: NO
VERSION_71_OR_HIGHER_CREATED: NO
BUNDLE_BUILD_AND_PARITY: PASS | FAIL
LOGIC_VALIDATION: PASS | FAIL
GITHUB_CI_ACTUALLY_RAN: YES | NO
READY_FOR_CHATGPT_FINAL_REVIEW: YES | NO
BLOCKER: NONE | <specific blocker>
FINAL_COMMIT: <sha>
PR: #36 / <state>
```

## 15. Mandatory return identity

Final response must begin and end with:

```text
WORK_ID: 0026
DISPATCH_ID: 0026-CODEX-03
BALL: CHATGPT
STATUS: RETURNED
```

WORK_ID: `0026`
DISPATCH_ID: `0026-CODEX-03`
BALL: `CODEX`
STATUS: `READY`
