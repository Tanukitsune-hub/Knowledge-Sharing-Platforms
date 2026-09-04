# Work 0026 — CODEX-03 Gemini failure classification and bounded requalification report

WORK_ID: `0026`
DISPATCH_ID: `0026-CODEX-03`
BALL: `CHATGPT`
STATUS: `RETURNED`
MODE: `QUALIFICATION / DIAGNOSTIC REPAIR`

## Outcome

The unsafe generic external-limitation classification was repaired and the bounded target-runtime campaign completed. The one required `gemini-3.8-flash / explicit low / 2048` Interactions + File Search qualification ended in the safe class `HTTP_OR_CREDENTIAL_FAILURE`.

That class is an explicitly external-eligible transport/account boundary in the repaired decision table. It cannot be produced by response-shape, parser, citation identity, or other application failures, which now remain in the safe `ERROR` state. Gemini therefore remains disabled and hidden with an exact evidence-supported terminal status.

```text
GEMINI_OPTIONAL_PROVIDER_STATUS: DISABLED_EXTERNAL_LIMITATION
EXACT_EXTERNAL_LIMITATION: HTTP_OR_CREDENTIAL_FAILURE
PRODUCT_AVAILABILITY_BLOCKER: NONE
WORK_ACCEPTANCE_BLOCKER: NONE
READY_FOR_CHATGPT_FINAL_REVIEW: YES
```

OpenAI and API-independent FULL_OUTPUT behavior were preserved. Neither route was called during this Dispatch.

## Safe classification repair

The transport and administrator qualification path now preserve only allowlisted, decision-relevant evidence and distinguish:

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

Provider terminal status and allowlisted provider error codes may reach the classifier. Raw responses, provider messages, credentials, provider resource identifiers, Store/document names, source contents and private URLs do not.

The administrator mutator writes `DISABLED_EXTERNAL_LIMITATION` only when the classifier explicitly marks a result external. Generic exceptions, malformed response shapes and citation/source-integrity failures remain disabled/hidden in `ERROR` and cannot be relabelled external.

Focused failure-injection tests cover the successful tuple, model access/unsupported fallback gate, provider terminal status and safe code preservation, no-answer, no-citation, citation mismatch, generic/application failure, external-only persistence, failed-route hiding and absence of cross-provider fallback.

## Deterministic validation

```text
FOCUSED_WORK_0026_TESTS: PASS / 87 of 87
BUNDLE_REPRODUCIBILITY: PASS / two consecutive builds byte-identical
CHECK_BUNDLE: PASS / 27 of 27
NPM_RUN_CHECK: PASS / 420 of 420
AGENT_FOUNDATION: PASS
GIT_DIFF_CHECK: PASS
BUNDLE_BYTES: 993499
BUNDLE_SHA256: 5c53b811fb84be249cf0d5e557a3728e5f92e1ef1393ef20e45103796a4089b2
```

The deterministic generated bundle and release manifest were regenerated from authoritative modular `src/`; generated artifacts were not edited by hand.

## Source delivery and deployment

The exact tested source was delivered once and read back once. Normalized readback matched all 82 deployable files with no missing or content-mismatched file.

Exactly one immutable Apps Script version was created: version 70. The same existing private Web App was updated once from version 69 to version 70. Final read-only deployment inventory showed exactly one version-70 Web App deployment, no version-69 Web App deployment, version 67 unused, and no version 71 or higher.

```text
SOURCE_DELIVERY_READBACK: PASS / 82 of 82
APPS_SCRIPT_SOURCE_DELIVERY: 1
NEW_IMMUTABLE_VERSION: 1 / version 70
SAME_PRIVATE_WEB_APP_UPDATE: 1 / 69 -> 70
VERSION_67_DEPLOYED: NO
VERSION_71_OR_HIGHER_CREATED: NO
```

## Version 70 shell smoke

The root page and Knowledge Search page were checked in the normal private Web App after deployment.

```text
ROOT_PAGE_RENDER_AND_BOOTSTRAP: PASS
KNOWLEDGE_PAGE_RENDER_AND_BOOTSTRAP: PASS
LITERAL_INCLUDE_DIRECTIVES: 0
EXPECTED_STYLES_AND_CLIENT_BOOTSTRAP: PRESENT
NORMAL_NON_AI_READ_ONLY_FACADE: PASS
BLOCKING_BROWSER_CONSOLE_ERRORS: 0
```

The shell passed before the provider qualification was invoked.

## Source/provider integrity

The existing configured Gemini credential and Store remained available to the private administrator flow. The qualification's pre-query exact reconciliation for `DOC-000017` reached the provider call, proving that it found one current exact metadata match; otherwise the repaired application path would have stopped as a product/source-integrity error before a query.

The accepted CODEX-02 read-only evidence for `MTG-000005` and zero duplicate current documents was preserved as instructed. No source sync, upload, Store creation, deletion or broad reconciliation occurred, and no contradictory runtime evidence appeared.

```text
GEMINI_KEY_AND_STORE: PASS
DOC-000017_EXACT_DOCUMENT: 1 / current exact metadata match
MTG-000005_EXACT_DOCUMENT: 1 / accepted closed evidence preserved
GEMINI_DOCUMENT_DUPLICATES: 0 / accepted closed evidence preserved
GEMINI_SOURCE_SYNC_OR_UPLOAD: 0
GEMINI_STORE_CREATE: 0
NORMAL_USER_GEMINI_ROUTE_VISIBLE: NO
```

## Bounded Gemini campaign

One normal private-administrator qualification action completed in approximately 40.2 seconds. The repaired result left the Gemini profile failed, the normal-user Gemini route hidden, and the provider readiness state `DISABLED_EXTERNAL_LIMITATION`.

The displayed safe state uniquely maps to `HTTP_OR_CREDENTIAL_FAILURE`: model/access evidence would have marked API access unavailable and opened the 3.7 fallback; provider-terminal or completed grounding/citation failures would have marked API access available and opened the GenerateContent control; application/response-shape failure would have written `ERROR`, not the external state.

Because `HTTP_OR_CREDENTIAL_FAILURE` authorizes no second call under the committed decision tree, neither the 3.7 Interactions fallback nor the 3.8 GenerateContent control was run.

```text
GEMINI_QUERY_CALLS: 1
PRIMARY_MODEL: gemini-3.8-flash
PRIMARY_THINKING: explicit low
PRIMARY_MAX_OUTPUT_TOKENS: 2048
PRIMARY_TRANSPORT: Interactions + File Search
PRIMARY_3_8_INTERACTIONS_CLASS: HTTP_OR_CREDENTIAL_FAILURE
SECOND_CONTROL: NOT_USED
SECOND_CONTROL_CLASS: NOT_RUN
EXACT_EXTERNAL_LIMITATION: HTTP_OR_CREDENTIAL_FAILURE
GEMINI_OPTIONAL_PROVIDER_STATUS: DISABLED_EXTERNAL_LIMITATION
```

No raw response, provider message, provider identifier, source body, credential or private URL was persisted or exposed by the repaired result.

## Official-contract check

At execution time, Google's official Gemini 3.8 model and File Search documentation continued to describe Gemini 3.8 Flash as File Search capable, while the Interactions reference model enumeration did not list 3.8 Flash. This remains contextual evidence only; the terminal classification above comes from the bounded runtime result, not documentation inference.

- `https://ai.google.dev/gemini-api/docs/models/gemini-3.8-flash`
- `https://ai.google.dev/gemini-api/docs/file-search`
- `https://ai.google.dev/api/interactions-api-v1`

## Side-effect and final integrity

```text
GEMINI_SOURCE_MUTATION: NO
GEMINI_PROVIDER_RESOURCE_MUTATION: NO
OPENAI_API_CALLED: NO
FULL_OUTPUT_RUNTIME_CALLED: NO
NO_CROSS_PROVIDER_FALLBACK: PASS
OPENAI_ACCEPTED_PATH_PRESERVED: PASS
PRIVATE_WEB_APP_VERSION: 70
UNAUTHORIZED_DEPLOYMENT: NO
CONFIDENTIAL_DATA_USED: NO
```

## Completion latch

```text
FAILURE_CLASSIFICATION_REPAIR: PASS
UNKNOWN_FAILURE_RELABELLED_EXTERNAL: NO
SAFE_DIAGNOSTIC_TEST_MATRIX: PASS
PREDEPLOY_LOGIC_VALIDATION: PASS
SOURCE_DELIVERY_READBACK: PASS
RUNTIME_DEPLOYMENT_VERSION: 70
WEB_APP_SHELL: PASS
GEMINI_KEY_AND_STORE: PASS
DOC-000017_EXACT_DOCUMENT: 1
MTG-000005_EXACT_DOCUMENT: 1
GEMINI_QUERY_CALLS: 1
PRIMARY_3_8_INTERACTIONS_CLASS: HTTP_OR_CREDENTIAL_FAILURE
SECOND_CONTROL: NOT_USED
SECOND_CONTROL_CLASS: NOT_RUN
EXACT_EXTERNAL_LIMITATION: HTTP_OR_CREDENTIAL_FAILURE
GEMINI_OPTIONAL_PROVIDER_STATUS: DISABLED_EXTERNAL_LIMITATION
NORMAL_USER_GEMINI_ROUTE_VISIBLE: NO
NO_CROSS_PROVIDER_FALLBACK: PASS
OPENAI_ACCEPTED_PATH_PRESERVED: PASS
OPENAI_API_CALLED: NO
FULL_OUTPUT_RUNTIME_CALLED: NO
GEMINI_DOCUMENT_DUPLICATES: 0
VERSION_67_DEPLOYED: NO
VERSION_71_OR_HIGHER_CREATED: NO
BUNDLE_BUILD_AND_PARITY: PASS
LOGIC_VALIDATION: PASS / 420 of 420
GITHUB_CI_ACTUALLY_RAN: NO
READY_FOR_CHATGPT_FINAL_REVIEW: YES
BLOCKER: NONE
FINAL_IMPLEMENTATION_COMMIT: 90bcaab90051a7975e5b9da99917b7d1fe0e6402
FINAL_COMMIT: reported in PR and final return after tracking commit creation
PR: #36 / Draft / Open / unmerged
```

## Shared Knowledge

KNOWLEDGE_RETRIEVAL: RULE-0001, RULE-0002, PAT-0002, PAT-0004, OBS-0018
KNOWLEDGE_APPLIED: RULE-0001, RULE-0002, PAT-0002, PAT-0004, OBS-0018
NEW_KNOWLEDGE_CANDIDATE: YES

WORK_ID: `0026`
DISPATCH_ID: `0026-CODEX-03`
BALL: `CHATGPT`
STATUS: `RETURNED`
