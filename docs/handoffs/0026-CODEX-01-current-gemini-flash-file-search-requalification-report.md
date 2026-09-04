# Work 0026 — CODEX-01 current Gemini Flash / File Search requalification report

WORK_ID: `0026`
DISPATCH_ID: `0026-CODEX-01`
BALL: `CHATGPT`
STATUS: `RETURNED`

## Outcome

The current Gemini API/model-policy implementation and deterministic bundle contracts pass, but target-runtime qualification stopped before any Gemini provider call because the newly deployed modular Web App rendered server-side include directives as literal text.

This is a product runtime regression, not a Gemini external limitation. Therefore neither `QUALIFIED` nor `DISABLED_EXTERNAL_LIMITATION` is claimed.

```text
LOGIC_VALIDATION: PASS
TARGET_RUNTIME_QUALIFICATION: FAIL / STOPPED BEFORE PROVIDER CALL
READY_FOR_CHATGPT_FINAL_REVIEW: NO
BLOCKER: FULL_WEB_APP_MODULAR_TEMPLATE_INCLUDE_RUNTIME_REGRESSION
```

The one-version and one-deployment budgets were already consumed by version 68 when the regression became directly observable. No version 69 was created, version 67 remains unused, and no rollback or second deployment update was attempted.

## Work contract and evidence hierarchy

```text
MODE: IMPLEMENT -> BOUNDED PROVIDER DIAGNOSIS -> QUALIFICATION
PRIMARY_OUTCOME: qualify one exact current Gemini File Search tuple or leave Gemini disabled on a proven external limitation
STRONGEST_EVIDENCE: same private Web App target-runtime response
SECONDARY_EVIDENCE: exact Apps Script source readback and official current Google API documentation
DETERMINISTIC_EVIDENCE: focused tests, canonical checks, generated bundle parity
MUTATION_BUDGET: one immutable version and one update of the same private Web App
PROVIDER_BUDGET_USED: Gemini 0, OpenAI 0
RESET_CONDITION_REACHED: accepted-path Web App shell regression after the only authorized deployment
```

## Official current Gemini baseline

Current official references were checked before implementation:

- `gemini-3.8-flash` is the preferred exact model and supports File Search and explicit `low`, `medium`, and `high` thinking; `minimal` is not used: <https://ai.google.dev/gemini-api/docs/models/gemini-3.8-flash>
- current File Search examples use the Interactions API, `file_search_store_names`, `metadata_filter`, and `file_citation`: <https://ai.google.dev/gemini-api/docs/file-search>
- the Interactions request supports exact model, tools, thinking level, output ceiling, and synchronous/background lifecycle shapes: <https://ai.google.dev/api/interactions-api-v1>
- current model lifecycle status was checked without using moving `latest` aliases: <https://ai.google.dev/gemini-api/docs/deprecations>

The implemented candidate order remains:

```text
PRIMARY: gemini-3.8-flash / low / 2048
ACCESS_OR_UNSUPPORTED_FALLBACK_ONLY: gemini-3.7-flash / low / 2048
AUTOMATIC_MODEL_FALLBACK: prohibited
CROSS_PROVIDER_FALLBACK: prohibited
```

## Implemented current-code repair

- Gemini query transport is the current Interactions/File Search request shape.
- The normal query request uses the server-resolved model, exact thinking raw value, output ceiling, Store identity and request-profile version.
- Obsolete request revision headers were removed.
- Gemini credential and Store administration remains boolean-only and administrator-guarded.
- Exact tuple qualification is bound to the existing Store and exact source metadata.
- Gemini stays absent from normal-user choices until provider readiness and one exact tuple qualification pass.
- Citation normalization requires authoritative source identity and current metadata.
- START creates at most one interaction, repeated START reuses the job, and POLL performs one read without creating work.
- No OpenAI fallback or automatic Gemini model fallback was added.

The implementation commit before runtime delivery was `e8885da8b85f286dcfbb3bf8c5b538852cef71a8`.

## Source delivery and deployment

```text
LOCAL_SOURCE_TO_APPS_SCRIPT_DELIVERY: ONCE
EXACT_READBACK: PASS / 82 of 82 files
IMMUTABLE_VERSION_CREATED: 68 / exactly once
VERSION_67_DEPLOYED: NO
SAME_PRIVATE_WEB_APP_UPDATE: version 66 -> version 68 / exactly once
```

No credential, provider Store/File ID, deployment ID, private URL, raw provider payload, or source body was emitted.

## Decisive target-runtime evidence

After the version-68 update, both a normal reload and a cache-bypassed reload returned the Web App title and base page markup, but showed the `<?!= include_(...) ?>` directives literally. The included admin page and client scripts therefore were not expanded or executed. Gemini administration, exact source reconciliation, tuple qualification, and normal-product START/POLL could not be invoked safely.

Historical version-66 source used `HtmlService.createTemplateFromFile(...)`. Work 0023 introduced a bundle-aware resource loader that routed modular source through a string template. The target runtime proved that this changed modular behavior even though the bundle harness passed.

The branch now contains the smallest fail-closed repair:

- bundle mode continues using its embedded HTML string resources;
- modular Apps Script mode again uses `createTemplateFromFile(...)`;
- a focused regression test requires the modular file-template path.

Repair commit: `681768824f298eff24439b2ee69c9ce159af1e0e`.

This repair is intentionally not delivered or deployed in this Dispatch because doing so would exceed both authorized runtime budgets. Version 68 therefore remains the deployed but blocked runtime pending a separately authorized deployment of the already-tested repair.

## Validation

```text
FOCUSED_GEMINI_TESTS_BEFORE_DEPLOYMENT: PASS / 127 of 127
FOCUSED_MODULAR_TEMPLATE_REGRESSION_TEST: PASS / 5 of 5 bundle-runtime-parity tests
npm run check:bundle: PASS / 27 of 27
npm run check: PASS / 410 of 410
python tools/validate_agent_foundation.py: PASS
git diff --check: PASS / line-ending notices only
BUNDLE_TWO_CLEAN_BUILDS_BYTE_IDENTICAL: YES
BUNDLE_BYTE_COUNT: 971044
BUNDLE_FILE_SHA256: c234c849ad86571140622ca5a4913dbf04122d9dc81642a4710a3ebabf3f5c75
BUNDLE_SOURCE_COMMIT: 681768824f298eff24439b2ee69c9ce159af1e0e
```

OpenAI runtime was not called. FULL_OUTPUT runtime was not rerun. Deterministic OpenAI, FULL_OUTPUT, bundle and installer regression tests remain passing, but version 68 cannot expose any product route while includes are unexpanded.

## Required field report

```text
OFFICIAL_GEMINI_API_BASELINE: PASS / current official 3.8 Flash, Interactions and File Search contracts checked
GEMINI_KEY_PRESENT: YES / safe boolean observed before deployment; value never read or exposed
GEMINI_STORE_RECONCILIATION: NOT_RUN / Web App template regression
PRIMARY_MODEL_CANDIDATE: gemini-3.8-flash
FALLBACK_MODEL_CANDIDATE: gemini-3.7-flash / access-or-unsupported only / not attempted
SELECTED_GEMINI_MODEL: NOT_SELECTED_AT_RUNTIME
SELECTED_THINKING_LEVEL: low / implemented candidate, not runtime-qualified
SELECTED_OUTPUT_CEILING: 2048 / implemented candidate, not runtime-qualified
GEMINI_ADMIN_CREDENTIAL_FLOW: PASS_LOGIC / NOT_RUN_RUNTIME
GEMINI_EXACT_TUPLE_QUALIFICATION: NOT_RUN
GEMINI_POLICY_DRIVEN_REQUEST: PASS_LOGIC
DIRECT_INTERACTIONS_CONTROL: NOT_RUN
PRODUCT_START_POLL_LIFECYCLE: PASS_LOGIC / NOT_RUN_RUNTIME
DIRECT_GENERATE_CONTENT_CONTROL: NOT_RUN / Interactions was not reached
GEMINI_PITCHBOOK_QUERY_CITATION: NOT_RUN
GEMINI_MEETING_QUERY_CITATION: NOT_RUN
GEMINI_METADATA_FILTER: PASS_LOGIC / NOT_RUN_RUNTIME
GEMINI_DOCUMENT_DUPLICATES: NOT_OBSERVED / reconciliation not reached
GEMINI_OPTIONAL_PROVIDER_STATUS: BLOCKED_BEFORE_PROVIDER_QUALIFICATION
NORMAL_USER_GEMINI_ROUTE_VISIBLE: NO / route not rendered; no qualification was granted
NO_CROSS_PROVIDER_FALLBACK: PASS
OPENAI_ACCEPTED_PATH_PRESERVED: PASS_LOGIC / TARGET_RUNTIME_SHELL_BLOCKED
FULL_OUTPUT_API_INDEPENDENCE: PASS_LOGIC / TARGET_RUNTIME_NOT_RUN
BUNDLE_BUILD_AND_PARITY: PASS
BUNDLE_BYTE_COUNT: 971044
BUNDLE_FILE_SHA256: c234c849ad86571140622ca5a4913dbf04122d9dc81642a4710a3ebabf3f5c75
LOGIC_VALIDATION: PASS / 410 of 410 canonical tests
TARGET_RUNTIME_QUALIFICATION: FAIL / stopped before provider call
RUNTIME_DEPLOYMENT_VERSION: 68
WORK_0021_RUNTIME_MUTATED_OUTSIDE_AUTHORIZATION: NO
OPENAI_API_CALLED: NO
GITHUB_CI_ACTUALLY_RAN: NO
READY_FOR_CHATGPT_FINAL_REVIEW: NO
BLOCKER: FULL_WEB_APP_MODULAR_TEMPLATE_INCLUDE_RUNTIME_REGRESSION
FINAL_COMMIT: pending final tracking commit
PR: #36 / Draft / Open / unmerged
```

## Safe next action

A new explicit Dispatch must authorize one immutable version and one update of the same private Web App for commit `681768824f298eff24439b2ee69c9ce159af1e0e` plus the final tracking commit. It must first prove normal Web App include expansion, then resume the still-unrun bounded Gemini campaign. Do not create or deploy another version under this returned Dispatch.

WORK_ID: `0026`
DISPATCH_ID: `0026-CODEX-01`
BALL: `CHATGPT`
STATUS: `RETURNED`
