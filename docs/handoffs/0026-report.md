# Work 0026 report

WORK_ID: `0026`
ACTIVE_DISPATCH_ID: `0026-CODEX-02`
BALL: `CODEX`
STATUS: `READY`

## Current state

Work 0023 is accepted and merged. Work 0026 CODEX-01 implemented the current Gemini API/model-policy path but returned with a target-runtime shell blocker before any Gemini provider call.

The existing production-capable reference remains OpenAI plus API-independent FULL_OUTPUT. Gemini is optional and must remain disabled/hidden until one exact current model/thinking/output/File Search tuple is qualified.

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

## Active CODEX-02

CODEX-02 is authorized to:

```text
verify deterministic repair
-> deliver/read back source once
-> create version 69 once
-> update the same private Web App once
-> prove root + Knowledge Search include expansion
-> only then resume the bounded Gemini campaign
```

If shell rendering still fails after the single update, it stops before any provider call and returns the new exact product blocker. Version 70 is not authorized.

After shell PASS, use only `DOC-000017` and `MTG-000005`, reuse the existing Store where valid, and attempt the exact `gemini-3.8-flash / low / 2048` tuple. `gemini-3.7-flash / low / 2048` is permitted only after explicit model-access/model-unsupported evidence for 3.8.

The Work provider terminal states remain:

```text
QUALIFIED
DISABLED_EXTERNAL_LIMITATION
```

`DISABLED_EXTERNAL_LIMITATION` is valid only after application/runtime/source-integrity defects are excluded and bounded current provider evidence identifies the external limitation.

## Current classification

### ACTIVE BLOCKER REPAIR / QUALIFICATION

- deploy and verify the already-tested modular-template repair;
- resume the bounded Gemini qualification only after shell PASS.

### FIX SOON

- GitHub CI is absent;
- automated Chrome native file selection remains unreliable.

### DEFERRED

- representative large-file indexing;
- historical-material migration;
- final company Shared Drive/domain-user rollout and company credential qualification.

Detailed instruction:

`docs/handoffs/0026-CODEX-02-runtime-template-repair-and-gemini-qualification-instruction.md`

WORK_ID: `0026`
ACTIVE_DISPATCH_ID: `0026-CODEX-02`
BALL: `CODEX`
STATUS: `READY`
