# Work 0021 report

WORK_ID: `0021`
ACTIVE_DISPATCH_ID: `0021-CODEX-04`
BALL: `USER`
STATUS: `ACTION_REQUIRED`

## Executive conclusion

Work 0021 is accepted through CODEX-03. The canonical filters, five modes, explicit 2–5 Entity comparison, per-Entity citation attribution, exact Related GP / Meeting Type filters, and FULL_OUTPUT parity remain qualified on private Web App version 63.

CODEX-04 local deterministic validation reached `371/371` PASS. Target-runtime six-format qualification has not started because the attached Chrome extension in Profile 2 cannot open/expose the native chooser for the normal registration flow. All six workspace-local fixture copies were readable; the failure occurs before file assignment.

The user confirmed the Chrome extension setting `Allow access to file URLs / ファイルのURLへのアクセスを許可する` is already ON. The earlier label `CHROME_EXTENSION_FILE_UPLOAD_PERMISSION` is therefore not considered a proven root cause.

Current blocker classification:

```text
BLOCKER: BROWSER_EXTENSION_FILE_CHOOSER_BRIDGE_UNAVAILABLE_PROFILE_2
TARGET_RUNTIME_QUALIFICATION: BLOCKED / NOT RUN
PRIVATE_WEB_APP_VERSION: 63 / UNCHANGED
RUNTIME_MUTATION: NONE
PROVIDER_MUTATION: NONE
NEW_FORMAT_FIXTURES_REGISTERED: 0
```

Fully exit Chrome and reopen Profile 2 to reload the extension/permission process, then resume the same `0021-CODEX-04`. If the same fresh-process failure persists, reinstall the Browser plugin from the ChatGPT plugin UI. Do not create CODEX-05.

## Accepted CODEX-02 evidence

```text
ROOT_CAUSE: METADATA_ONLY_PROVIDER_ATTRIBUTE_DRIFT_AND_PITCHBOOK_FUND_STRATEGY_SOURCE_OMISSION
EXACT_PROVIDER_ATTRIBUTE_READBACK: PASS
METADATA_ONLY_RECONCILIATION: PASS
NUMERIC_DATE_RANGE_FILTER: NOT_APPLICABLE
OPENAI_COMPOUND_FILTER_QUERY: PASS
FIVE_MODE_RUNTIME_CORE: PASS
FULL_OUTPUT_RUNTIME_PARITY: PASS
GEMINI_DISABLED_NO_FAILOVER: PASS
LOGIC_VALIDATION: PASS — 360/360
TARGET_RUNTIME_QUALIFICATION: PASS
PRIVATE_WEB_APP_VERSION: 62
APPS_SCRIPT_READBACK: PASS — 80/80
BLOCKER: NONE
```

CODEX-02 report:

`docs/handoffs/0021-CODEX-02-openai-filter-metadata-reconciliation-and-core-runtime-qualification-report.md`

## Accepted CODEX-03 evidence

```text
MULTI_ENTITY_REQUEST_VALIDATION: PASS
MULTI_ENTITY_COMPARISON: PASS
PER_ENTITY_CITATION_ATTRIBUTION: PASS
EVIDENCE_GAP_HANDLING: PASS
RELATED_GP_EXACT_FILTER: PASS
MEETING_TYPE_EXACT_FILTER: PASS
FULL_OUTPUT_MULTI_ENTITY_PARITY: PASS
OPENAI_RUNTIME_MULTI_ENTITY: PASS
OPENAI_RUNTIME_ADVANCED_FILTER: PASS
LOGIC_VALIDATION: PASS — 368/368
TARGET_RUNTIME_QUALIFICATION: PASS
PRIVATE_WEB_APP_VERSION: 63
APPS_SCRIPT_READBACK: PASS — 80/80
BLOCKER: NONE
```

CODEX-03 report:

`docs/handoffs/0021-CODEX-03-multi-entity-comparison-and-advanced-exact-filters-report.md`

## Active CODEX-04

Detailed instruction:

`docs/handoffs/0021-CODEX-04-six-format-openai-capability-and-final-work-qualification-instruction.md`

Operational pause/resume diagnostic:

`docs/handoffs/0021-dispatches.md`

Current CODEX-04 report:

`docs/handoffs/0021-CODEX-04-six-format-openai-capability-and-final-work-qualification-report.md`

After local upload access is positively established, CODEX-04 continues the bounded six-format matrix only:

```text
pdf / pptx / xlsx / docx / txt / eml
```

Gemini live recovery, large-file behavior, Work 0023, historical migration, company rollout and general hardening remain outside Work 0021.

## Scope discipline

Do not reopen accepted CODEX-02/CODEX-03 evidence. Do not mutate runtime/provider state during browser-path diagnosis. Do not ask the user to repeat the already-enabled file-URL toggle unless fresh evidence proves that exact Chrome profile lacks it.

WORK_ID: `0021`
ACTIVE_DISPATCH_ID: `0021-CODEX-04`
BALL: `USER`
STATUS: `ACTION_REQUIRED`
