# Work 0026 — current Gemini Flash / File Search requalification

WORK_ID: `0026`
DISPATCH_ID: `0026-CODEX-03`
BALL: `CODEX`
STATUS: `READY`
MODE: `QUALIFICATION / DIAGNOSTIC REPAIR`

## Primary outcome

Complete an evidence-correct bounded Gemini requalification without disturbing the accepted OpenAI/FULL_OUTPUT product.

Active detailed instruction:

`docs/handoffs/0026-CODEX-03-gemini-failure-classification-and-bounded-requalification-instruction.md`

Planning:

`docs/planning/work0026-gemini-current-api-requalification.md`

Runtime locator:

`docs/operations/runtime-artifact-locator.md`

## Accepted baseline

```text
WORK_0020 / 0025 / 0021 / 0023: ACCEPTED
PR_36: Draft / Open / unmerged
CURRENT_PRIVATE_WEB_APP_VERSION: 69 / modular shell PASS
VERSION_67: unused / never deploy
OPENAI: accepted
FULL_OUTPUT: accepted
BUNDLE_INSTALLER: accepted
GEMINI: disabled and hidden
```

## Closed CODEX-02 evidence

```text
ROOT_AND_KNOWLEDGE_SHELL: PASS
LITERAL_INCLUDE_DIRECTIVES: 0
BLOCKING_BROWSER_CONSOLE_ERRORS: 0
SOURCE_READBACK: PASS / 82 of 82
DOC-000017_AND_MTG-000005: exactly one active Gemini document each
GEMINI_DOCUMENT_DUPLICATES: 0
PRIMARY_TUPLE: gemini-3.8-flash / low / 2048
DIRECT_INTERACTIONS_CONTROL: FAIL / approximately 79 seconds
OPENAI_API_CALLED: NO
FULL_OUTPUT_LIVE_CALLED: NO
LOGIC_VALIDATION: PASS / 410 of 410
```

Do not re-open the shell repair, exact source reconciliation or accepted OpenAI/FULL_OUTPUT evidence without material contradictory runtime evidence.

## ChatGPT review blocker

CODEX-02 did not preserve enough safe diagnostic evidence to distinguish provider-terminal, no-grounded-answer, no-citation, citation-mapping and response-shape failures. The current catch path writes `DISABLED_EXTERNAL_LIMITATION` for any non-access Gemini qualification exception and replaces it with generic `AI_MODEL_QUALIFICATION_FAILED`.

```text
PRODUCT_AVAILABILITY_BLOCKER: NONE
WORK_ACCEPTANCE_BLOCKER: GEMINI_EXTERNAL_LIMITATION_CLASSIFICATION_NOT_EVIDENCED
```

The exact external limitation has not yet been proven. PR #36 must remain unmerged.

## CODEX-03 authority

CODEX-03 may:

1. implement distinct safe Gemini qualification failure classes;
2. prevent generic/application failures from being relabeled external;
3. add the focused deterministic failure-classification test matrix;
4. deliver/read back source once;
5. create version 70 and update the same private Web App once;
6. re-smoke the shell;
7. read back the existing two exact Gemini documents without sync/upload;
8. run one required 3.8 Interactions qualification;
9. run at most one mutually exclusive 3.7 fallback or 3.8 GenerateContent control under the detailed decision tree;
10. return an exact evidence-supported terminal outcome.

## Fixed boundaries

- no moving `latest` alias;
- no `minimal` for 3.8/3.7;
- no automatic model or cross-provider fallback;
- no broad sync/reindex;
- no source upload unless closed evidence is contradicted, in which case stop;
- no `DOC-000018`, six-format or large fixtures;
- no Store creation/replacement;
- no OpenAI API call;
- no FULL_OUTPUT live call;
- no version 67 deployment;
- no version 71 or higher;
- no model/transport/store/chunk/embedding experiment loop;
- no company rollout, historical migration, CI implementation or general hardening.

Keep PR #36 Draft/Open/unmerged. Do not merge it.

WORK_ID: `0026`
DISPATCH_ID: `0026-CODEX-03`
BALL: `CODEX`
STATUS: `READY`
