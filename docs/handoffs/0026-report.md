# Work 0026 report

WORK_ID: `0026`
ACTIVE_DISPATCH_ID: `0026-CODEX-01`
BALL: `CHATGPT`
STATUS: `RETURNED`

## Current state

Work 0023 is accepted and merged. Work 0026 CODEX-01 returned with a target-runtime blocker before the Gemini provider campaign.

The existing product remains usable through the accepted OpenAI and FULL_OUTPUT paths. Gemini is optional and must remain disabled/hidden until one exact current model/thinking/output/File Search tuple is qualified.

## Starting evidence

```text
PREFERRED_MODEL: gemini-3.8-flash
PREFERRED_THINKING: low
OUTPUT_CEILING: 2048
ONLY_ALLOWED_ACCESS_FALLBACK: gemini-3.7-flash
PRIOR_BACKGROUND_INTERACTIONS: provider long-running / no citation
PRIOR_GENERATE_CONTENT: approximately 83 seconds / no citation
CURRENT_CODE_QUERY_TRANSPORT: fixed GENERATE_CONTENT
CURRENT_CODE_QUERY_THINKING_OUTPUT: fixed low / 2048
CURRENT_LIVE_MODEL_QUALIFICATION: OpenAI-only
ACCEPTED_PRIVATE_WEB_APP_VERSION: 66
VERSION_67: unused / never deploy
GITHUB_CI_ACTUALLY_RAN: NO
```

## CODEX-01 outcome

```text
CURRENT_GEMINI_API_AND_POLICY_IMPLEMENTATION: PASS_LOGIC
RUNTIME_VERSION_CREATED_AND_DEPLOYED: 68
WEB_APP_RENDER: FAIL / modular include directives unexpanded
GEMINI_PROVIDER_CALLS: 0
OPENAI_PROVIDER_CALLS: 0
TARGET_RUNTIME_QUALIFICATION: FAIL
BLOCKER: FULL_WEB_APP_MODULAR_TEMPLATE_INCLUDE_RUNTIME_REGRESSION
```

The branch contains a tested repair that restores `createTemplateFromFile(...)` for modular Apps Script while preserving embedded string templates for the generated bundle. A new explicit Dispatch is required to deploy and qualify that repair; CODEX-01 did not exceed its one-version/one-deployment budget.

## Current classification

### BLOCKER

- deploy the already-tested modular-template repair under new authority and verify normal Web App rendering before resuming Gemini qualification.

### FIX SOON

- GitHub CI is absent;
- automated Chrome native file selection remains unreliable.

### DEFERRED

- representative large-file indexing;
- historical-material migration;
- final company Shared Drive/domain-user rollout and company credential qualification.

Detailed instruction:

`docs/handoffs/0026-CODEX-01-current-gemini-flash-file-search-requalification-instruction.md`

WORK_ID: `0026`
ACTIVE_DISPATCH_ID: `0026-CODEX-01`
BALL: `CHATGPT`
STATUS: `RETURNED`
