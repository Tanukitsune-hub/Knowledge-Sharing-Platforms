# Work 0026 report

WORK_ID: `0026`
ACTIVE_DISPATCH_ID: `0026-CODEX-03`
BALL: `CHATGPT`
STATUS: `RETURNED`

## Current state

Work 0026 reached its permitted terminal provider outcome. The optional Gemini route remains safely disabled and hidden with the exact bounded runtime classification `HTTP_OR_CREDENTIAL_FAILURE`; accepted OpenAI and API-independent FULL_OUTPUT product paths remain available.

```text
GEMINI_OPTIONAL_PROVIDER_STATUS: DISABLED_EXTERNAL_LIMITATION
EXACT_EXTERNAL_LIMITATION: HTTP_OR_CREDENTIAL_FAILURE
PRODUCT_AVAILABILITY_BLOCKER: NONE
WORK_ACCEPTANCE_BLOCKER: NONE
READY_FOR_CHATGPT_FINAL_REVIEW: YES
PR_36: Draft / Open / unmerged
```

## CODEX-01 and CODEX-02 preserved evidence

CODEX-01 implemented the current Gemini route and exposed the modular-template runtime regression. CODEX-02 deployed the template repair as version 69, qualified the root and Knowledge Search shell, and established exactly one active metadata-matching Gemini document for each authorized small synthetic source with zero duplicates.

```text
DOC-000017_EXACT_GEMINI_DOCUMENTS: 1
MTG-000005_EXACT_GEMINI_DOCUMENTS: 1
GEMINI_DOCUMENT_DUPLICATES: 0
OPENAI_ACCEPTED_PATH: preserved
VERSION_67: unused / never deploy
```

## CODEX-03 result

CODEX-03 fixed only the reviewed failure-classification gap. Safe classifications now distinguish HTTP/credential, model/access, provider terminal status and allowlisted code, completed-no-answer, completed-no-citation, citation identity/metadata mismatch, and response-shape/application failure. Raw provider payloads, messages, resource identifiers, private URLs, source contents and credentials are not exposed.

Unknown and application failures cannot write `DISABLED_EXTERNAL_LIMITATION`. The focused failure-injection matrix passed, as did the generated-bundle and canonical checks.

```text
FOCUSED_TESTS: PASS / 87 of 87
CHECK_BUNDLE: PASS / 27 of 27
LOGIC_VALIDATION: PASS / 420 of 420
AGENT_FOUNDATION: PASS
BUNDLE_REPRODUCIBILITY: PASS
GIT_DIFF_CHECK: PASS
BUNDLE_BYTES: 993499
BUNDLE_SHA256: 5c53b811fb84be249cf0d5e557a3728e5f92e1ef1393ef20e45103796a4089b2
```

The exact tested source was delivered/read back once with 82 of 82 deployable files matching. Exactly version 70 was created and the same private Web App was updated once from version 69 to version 70. Version 70 root and Knowledge Search rendering/bootstrap passed with no literal includes and no blocking console errors.

```text
SOURCE_DELIVERY_READBACK: PASS / 82 of 82
PRIVATE_WEB_APP_VERSION: 70
ROOT_AND_KNOWLEDGE_SHELL: PASS
LITERAL_INCLUDE_DIRECTIVES: 0
BLOCKING_BROWSER_CONSOLE_ERRORS: 0
VERSION_67_DEPLOYED: NO
VERSION_71_OR_HIGHER_CREATED: NO
```

The one authorized `gemini-3.8-flash / explicit low / 2048` Interactions + File Search qualification completed in approximately 40.2 seconds and returned `HTTP_OR_CREDENTIAL_FAILURE`. Under the committed decision tree this class permits no second call. No 3.7 fallback or GenerateContent control was run.

```text
GEMINI_QUERY_CALLS: 1
PRIMARY_3_8_INTERACTIONS_CLASS: HTTP_OR_CREDENTIAL_FAILURE
SECOND_CONTROL: NOT_USED
SECOND_CONTROL_CLASS: NOT_RUN
GEMINI_ROUTE: disabled / hidden
OPENAI_API_CALLED: NO
FULL_OUTPUT_RUNTIME_CALLED: NO
GEMINI_SOURCE_SYNC_OR_UPLOAD: 0
GEMINI_STORE_CREATE: 0
```

Detailed report:

`docs/handoffs/0026-CODEX-03-gemini-failure-classification-and-bounded-requalification-report.md`

## Classification

### BLOCKER

- None for Work acceptance or normal product availability.

### FIX SOON

- GitHub CI remains absent unless an exact-head run is later observed.
- Automated Chrome native file selection remains an external tooling limitation.

### DEFERRED

- company Shared Drive/domain-user qualification;
- representative large-file indexing;
- historical-material migration and final company rollout.

The Work 0026 completion latch is closed pending ChatGPT's final PR review. Do not create another Dispatch for non-blocking refinements.

WORK_ID: `0026`
ACTIVE_DISPATCH_ID: `0026-CODEX-03`
BALL: `CHATGPT`
STATUS: `RETURNED`
