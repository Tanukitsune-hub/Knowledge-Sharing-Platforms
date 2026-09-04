# Work 0026 — CODEX-02 repaired runtime deployment and Gemini qualification report

WORK_ID: `0026`
DISPATCH_ID: `0026-CODEX-02`
BALL: `CHATGPT`
STATUS: `RETURNED`

## Outcome

The modular Apps Script template repair is deployed and qualified on the same private Web App as immutable version `69`. Normal and cache-bypassed loads of both the root page and the dedicated Knowledge Search page expanded all server-side includes, loaded the expected styles and client code, completed server-side bootstrap, and produced zero blocking browser console errors.

The bounded Gemini campaign then reached its acceptable terminal outcome:

```text
GEMINI_OPTIONAL_PROVIDER_STATUS: DISABLED_EXTERNAL_LIMITATION
WEB_APP_SHELL: PASS
GEMINI_EXACT_TUPLE: FAIL / safe terminal qualification failure after approximately 79 seconds
GEMINI_ENABLED_FOR_NORMAL_USERS: NO
OPENAI_ACCEPTED_PATH: PRESERVED / no OpenAI API call
BLOCKER: NONE / Work 0026 terminal outcome reached
```

The existing Gemini credential and Store were accessible. Exact reconciliation of only `DOC-000017` and `MTG-000005` succeeded with one active, metadata-matching provider document per source. The exact `gemini-3.8-flash / low / 2048` Interactions + File Search qualification then failed without an explicit model-access or model-unsupported response. Therefore the `gemini-3.7-flash` fallback was not attempted. Gemini remains disabled and absent from the normal-user route selector.

## Work contract and evidence hierarchy

```text
MODE: QUALIFICATION
PRIMARY_OUTCOME: deploy the tested shell repair, then qualify Gemini or leave it safely disabled on a bounded external limitation
STRONGEST_EVIDENCE: same private Web App version 69 plus normal administrator/product surfaces
SECONDARY_EVIDENCE: exact Apps Script readback and current official Google API documentation
DETERMINISTIC_EVIDENCE: focused tests, canonical checks, generated bundle parity
RUNTIME_MUTATION_BUDGET: one source delivery, one immutable version, one update of the same Web App
RESET_CONDITION: exact tuple failure without an allowed 3.7 fallback condition
```

## Independent pre-deployment verification

- local branch, remote branch and PR head all matched `a467dae183707af8e925aba12bfa96912bdb790f` with a clean working tree;
- commit `681768824f298eff24439b2ee69c9ce159af1e0e` was present;
- bundle mode still used `HtmlService.createTemplate(kspReadHtmlResource_(...))`;
- modular mode used `HtmlService.createTemplateFromFile(...)`;
- `doGet()` still routed through `kspCreateHtmlTemplate_()` and `include_()` through `kspReadHtmlResource_()`;
- the normal Gemini request remained policy-driven rather than fixed to a model, thinking value or output ceiling;
- the recorded generated bundle matched source and two builds remained byte-identical.

```text
FOCUSED_WORK_0026_TESTS: PASS / 121 of 121
npm run check:bundle: PASS / 27 of 27
npm run check: PASS / 410 of 410
python tools/validate_agent_foundation.py: PASS
git diff --check: PASS
BUNDLE_BYTES: 971044
BUNDLE_SHA256: c234c849ad86571140622ca5a4913dbf04122d9dc81642a4710a3ebabf3f5c75
```

## Source delivery and deployment

The exact tested modular source was delivered once. A fresh readback matched all `82` deployable `.gs`, `.html`, and manifest files; repository-only `src/AGENTS.md` was correctly excluded from the deployable inventory.

```text
SOURCE_DELIVERY: 1 / authorized maximum 1
SOURCE_READBACK: PASS / 82 of 82 deployable files
IMMUTABLE_VERSION_CREATED: 69 / exactly one
SAME_PRIVATE_WEB_APP_UPDATE: 68 -> 69 / exactly one
VERSION_67_DEPLOYED: NO
VERSION_70_OR_HIGHER_CREATED: NO
```

No new Apps Script project, Web App, Library, public endpoint or debug endpoint was created.

## Mandatory Web App shell smoke

Both pages were checked after a normal reload and a cache-bypassed reload.

```text
ROOT_PAGE_HTTP_AND_RENDER: PASS
ROOT_BOOTSTRAP: PASS / Meeting options loaded and ready status returned
KNOWLEDGE_PAGE_HTTP_AND_RENDER: PASS
KNOWLEDGE_BOOTSTRAP: PASS / provider/model/options configuration loaded
LITERAL_<?!=_DIRECTIVES: 0
LITERAL_INCLUDE_(...)_DIRECTIVES: 0
INCLUDED_STYLE_BLOCKS: PRESENT
INCLUDED_CLIENT_SCRIPTS: PRESENT
KNOWLEDGE_SEARCH_CONTROLS: PRESENT
NON_AI_READ_ONLY_FACADE: PASS / normal Meeting and Knowledge bootstrap responses had the expected shape
BLOCKING_BROWSER_CONSOLE_ERRORS: 0
```

The root bootstrap populated `31` GP choices and `8` Asset Class choices. The Knowledge page completed configuration and left the accepted OpenAI and API-independent FULL_OUTPUT routes available.

## Safe Gemini inventory and exact source reconciliation

Only safe booleans, states and counts were observed. No key value, Store name, provider document name, resource ID, private URL or raw response was recorded.

```text
GEMINI_KEY_PRESENT: YES
CONFIGURED_STORE_PRESENT: YES
CONFIGURED_STORE_ACCESSIBLE: YES
INITIAL_GEMINI_MODEL_PROFILES: 0
INITIAL_LEGACY_GEMINI_STATUS: ACTIVE / route still hidden because no qualified profile
POST_CONNECT_READINESS: READY_FOR_QUALIFICATION
STORE_TOTAL_DOCUMENT_COUNT: NOT_SAFELY_OBSERVABLE on the redacted private-admin surface
```

The normal administrator connection check reused the configured Store and completed successfully. Each authorized source was then synchronized once through the exact `sourceType + sourceId` path:

```text
Pitchbook / DOC-000017: selected 1 / indexed 1 / removed 0 / failed 0
Meeting / MTG-000005: selected 1 / indexed 1 / removed 0 / failed 0
SOURCE_READBACK: ACTIVE + exact source_type + source_id + content_hash
CURRENT_DOCUMENTS_PER_SOURCE: exactly 1
DUPLICATE_CURRENT_DOCUMENTS: 0
OTHER_SOURCES_TOUCHED: 0
```

The exact-sync implementation failed closed unless the pre-upload provider inventory was unambiguous. For both sources it observed no prior owned document, uploaded one replacement, and read back its active state and exact metadata before persisting the provider state.

## Exact tuple qualification

The normal administrator model-policy path persisted this exact profile before qualification:

```text
PROFILE_ID: gemini-38-low
MODEL: gemini-3.8-flash
THINKING: explicit low
MAX_OUTPUT_TOKENS: 2048
REQUEST_PROFILE: current Interactions + File Search profile
QUALIFICATION_SOURCE: Pitchbook / DOC-000017
QUALIFICATION_FILTER: exact source_id
```

The one synchronous Interactions control ran for approximately `79,132 ms` and returned the application's safe final failure. It did not return the explicit model-access/model-unsupported evidence required to open the `gemini-3.7-flash` fallback. Store accessibility, exact upload/index/readback and deterministic request/citation contracts had already passed, so the bounded observation is classified as the current Gemini Interactions/File Search terminal-or-citation layer failing to produce the required grounded answer plus authoritative citation.

No automatic model fallback, cross-provider fallback or second model attempt occurred. A GenerateContent control was not run: the direct Interactions call returned a terminal qualification failure rather than remaining nonterminal at the hard observation bound, and no additional public/debug execution surface was added merely to force another provider call.

Because the exact tuple gate failed, the normal-product START/POLL, Meeting query and positive/negative metadata-filter campaign were not run. This is the required stop behavior, not a claim that those runtime gates passed.

## Fail-closed product state

- the failed Gemini profile is retained as `FAILED`, not selectable;
- provider readiness is `DISABLED_EXTERNAL_LIMITATION`;
- Gemini is absent from the normal-user route selector;
- only `OPENAI` and `FULL_EXPORT` remain visible;
- OpenAI remained configured, Store-ready and active before and after the campaign;
- no OpenAI API request or live FULL_OUTPUT request was made;
- accepted bundle/installer defaults still keep optional providers disabled on fresh install.

## Side-effect and integrity state

```text
WEB_APP_DEPLOYMENT: version 69 on the same private deployment
GEMINI_SETTINGS: exact 3.8 profile retained as failed; provider disabled
GEMINI_SOURCE_MUTATION: only DOC-000017 and MTG-000005 provider-state/index reconciliation
OPENAI_SOURCE_OR_POLICY_MUTATION: NONE
FULL_OUTPUT_RUNTIME_CALL: NONE
DOC-000018_MUTATION: NONE
SIX_FORMAT_FIXTURE_MUTATION: NONE
LARGE_FIXTURE_MUTATION: NONE
BROAD_SYNC: NONE
```

## Completion latch

```text
MODULAR_TEMPLATE_REPAIR_PRESENT: PASS
PREDEPLOY_LOGIC_VALIDATION: PASS
SOURCE_DELIVERY_READBACK: PASS
RUNTIME_DEPLOYMENT_VERSION: 69
WEB_APP_ROOT_RENDER: PASS
WEB_APP_KNOWLEDGE_RENDER: PASS
LITERAL_INCLUDE_DIRECTIVES: 0
BLOCKING_BROWSER_CONSOLE_ERRORS: 0
GEMINI_KEY_PRESENT: YES
GEMINI_STORE_RECONCILIATION: PASS
PRIMARY_MODEL_CANDIDATE: gemini-3.8-flash
FALLBACK_MODEL_CANDIDATE: NOT_USED / no explicit access-or-unsupported evidence
SELECTED_GEMINI_MODEL: gemini-3.8-flash
SELECTED_THINKING_LEVEL: low
SELECTED_OUTPUT_CEILING: 2048
GEMINI_EXACT_TUPLE_QUALIFICATION: FAIL
DIRECT_INTERACTIONS_CONTROL: FAIL / safe terminal result after approximately 79 seconds
DIRECT_GENERATE_CONTENT_CONTROL: NOT_RUN
PRODUCT_START_POLL_LIFECYCLE: NOT_RUN / exact tuple stop gate
GEMINI_PITCHBOOK_QUERY_CITATION: FAIL / direct qualification did not return the required grounded citation
GEMINI_MEETING_QUERY_CITATION: NOT_RUN / exact tuple stop gate
GEMINI_METADATA_FILTER: FAIL / exact positive result not established; negative check not run
GEMINI_DOCUMENT_DUPLICATES: 0
GEMINI_OPTIONAL_PROVIDER_STATUS: DISABLED_EXTERNAL_LIMITATION
NORMAL_USER_GEMINI_ROUTE_VISIBLE: NO / expected fail-closed state
NO_CROSS_PROVIDER_FALLBACK: PASS
OPENAI_ACCEPTED_PATH_PRESERVED: PASS
FULL_OUTPUT_API_INDEPENDENCE: PASS / deterministic evidence; no live rerun
BUNDLE_BUILD_AND_PARITY: PASS
LOGIC_VALIDATION: PASS / 410 of 410
FINAL_PROVIDER_AND_SOURCE_INTEGRITY: PASS
WORK_0021_RUNTIME_MUTATED_OUTSIDE_AUTHORIZATION: NO
OPENAI_API_CALLED: NO
GITHUB_CI_ACTUALLY_RAN: NO
READY_FOR_CHATGPT_FINAL_REVIEW: YES
BLOCKER: NONE / acceptable DISABLED_EXTERNAL_LIMITATION terminal outcome
FINAL_COMMIT: PR head reported at return
PR: #36 / Draft / Open / unmerged
```

## Shared Knowledge

KNOWLEDGE_RETRIEVAL: RULE-0001, RULE-0002, PAT-0002, PAT-0004, OBS-0018
KNOWLEDGE_APPLIED: RULE-0001, RULE-0002, PAT-0002, PAT-0004, OBS-0018
NEW_KNOWLEDGE_CANDIDATE: YES

WORK_ID: `0026`
DISPATCH_ID: `0026-CODEX-02`
BALL: `CHATGPT`
STATUS: `RETURNED`
