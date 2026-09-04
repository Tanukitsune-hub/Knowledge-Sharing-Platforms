# Work 0026 report

WORK_ID: `0026`
ACTIVE_DISPATCH_ID: `0026-CODEX-02`
BALL: `CHATGPT`
STATUS: `RETURNED`

## Terminal state

Work 0026 completed with the acceptable terminal provider outcome `DISABLED_EXTERNAL_LIMITATION`.

CODEX-02 deployed the tested modular-template repair as version `69` on the same private Web App. Root and Knowledge Search passed normal and cache-bypassed shell smoke with all includes expanded, normal server bootstrap complete and zero blocking console errors.

The existing Gemini credential and Store were accessible. Exact reconciliation succeeded only for the authorized small sources `DOC-000017` and `MTG-000005`, each with one active metadata-matching document and no duplicate. The exact `gemini-3.8-flash / low / 2048` synchronous Interactions + File Search qualification then returned a safe failure after approximately 79 seconds without explicit model-access/model-unsupported evidence. The `gemini-3.7-flash` fallback was therefore not permitted or attempted.

Gemini remains disabled and hidden from normal users. OpenAI and API-independent FULL_OUTPUT remain the production-capable paths.

## CODEX-01 accepted evidence

```text
PREFERRED_MODEL: gemini-3.8-flash
PREFERRED_THINKING: low
OUTPUT_CEILING: 2048
ONLY_ALLOWED_ACCESS_FALLBACK: gemini-3.7-flash
CURRENT_GEMINI_API_AND_POLICY_IMPLEMENTATION: PASS_LOGIC
LOGIC_VALIDATION: PASS / 410 of 410
RUNTIME_VERSION_CREATED_AND_DEPLOYED: 68
WEB_APP_RENDER: FAIL / modular include directives unexpanded
GEMINI_PROVIDER_CALLS: 0
OPENAI_PROVIDER_CALLS: 0
BLOCKER: FULL_WEB_APP_MODULAR_TEMPLATE_INCLUDE_RUNTIME_REGRESSION
REPAIR_COMMIT: 681768824f298eff24439b2ee69c9ce159af1e0e
```

The repair restores `HtmlService.createTemplateFromFile(...)` for modular Apps Script while preserving embedded string-template evaluation for the generated single-file bundle. GitHub inspection confirmed the repair is minimal and covered by a dedicated modular-runtime parity regression test.

## CODEX-02 completion evidence

```text
MODULAR_TEMPLATE_REPAIR: PASS
SOURCE_DELIVERY_READBACK: PASS / 82 of 82 deployable files
PRIVATE_WEB_APP_VERSION: 69
WEB_APP_ROOT_RENDER: PASS
WEB_APP_KNOWLEDGE_RENDER: PASS
LITERAL_INCLUDE_DIRECTIVES: 0
BLOCKING_BROWSER_CONSOLE_ERRORS: 0
GEMINI_KEY_AND_STORE: PRESENT / ACCESSIBLE
DOC-000017_EXACT_SYNC: PASS / selected 1 / indexed 1 / failed 0
MTG-000005_EXACT_SYNC: PASS / selected 1 / indexed 1 / failed 0
PRIMARY_TUPLE: gemini-3.8-flash / low / 2048
DIRECT_INTERACTIONS_CONTROL: FAIL / approximately 79 seconds
FALLBACK_MODEL: NOT_USED
PRODUCT_START_POLL: NOT_RUN / exact tuple stop gate
GEMINI_STATUS: DISABLED_EXTERNAL_LIMITATION
NORMAL_USER_GEMINI_ROUTE: HIDDEN
OPENAI_API_CALLED: NO
FULL_OUTPUT_LIVE_CALLED: NO
LOGIC_VALIDATION: PASS / 410 of 410
BUNDLE_PARITY: PASS
FINAL_INTEGRITY: PASS
BLOCKER: NONE
```

## Preserved accepted evidence

```text
WORK_0020_OPENAI_AND_FULL_OUTPUT: ACCEPTED / unchanged
WORK_0025_MODEL_POLICY: ACCEPTED / unchanged outside the scoped Gemini profile
WORK_0021_STRUCTURED_SEARCH_AND_SIX_FORMATS: ACCEPTED
WORK_0023_BUNDLE_AND_INSTALLER: ACCEPTED
VERSION_67: unused / never deployed
VERSION_70_OR_HIGHER: not created
```

## Current classification

### TERMINAL / READY FOR CHATGPT FINAL REVIEW

- merge/review is a ChatGPT decision; PR #36 remains Draft/Open/unmerged;
- do not reopen the bounded provider campaign without a new Work/Dispatch and materially new evidence.

### FIX SOON

- GitHub CI is absent;
- automated Chrome native file selection remains unreliable.

### DEFERRED

- representative large-file indexing;
- historical-material migration;
- final company Shared Drive/domain-user rollout and company credential qualification.

Detailed instruction:

`docs/handoffs/0026-CODEX-02-runtime-template-repair-and-gemini-qualification-instruction.md`

Detailed completion report:

`docs/handoffs/0026-CODEX-02-runtime-template-repair-and-gemini-qualification-report.md`

## Shared Knowledge

KNOWLEDGE_RETRIEVAL: RULE-0001, RULE-0002, PAT-0002, PAT-0004, OBS-0018
KNOWLEDGE_APPLIED: RULE-0001, RULE-0002, PAT-0002, PAT-0004, OBS-0018
NEW_KNOWLEDGE_CANDIDATE: YES

WORK_ID: `0026`
ACTIVE_DISPATCH_ID: `0026-CODEX-02`
BALL: `CHATGPT`
STATUS: `RETURNED`
