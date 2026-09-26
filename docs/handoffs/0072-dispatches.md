# Work 0072 dispatch control

WORK_ID: 0072
ACTIVE_DISPATCH_ID: 0072-CODEX-01
BALL: CODEX
STATUS: READY
MODE: BUILD
VALIDATION_TIER: TIER_2_STANDARD
PHASE: FOUR_SOURCE_CORE
USER_NATIVE_ACTION_BUDGET: 0
USER_PRESENCE_REQUIRED_BY_DEFAULT: NO

## Primary Outcome

Meeting / Pitchbook / News / Internal Assessmentを同じcanonical source scopeでKnowledge Search、citation/provenance、provider-neutral resolution、Full Outputへ接続する。

## Closed Conclusions

- Work0070 authoritative 4-source record layer is ACCEPTED.
- Work0071 UX baseline is ACCEPTED.
- schema9 / exactly seven Backend sheets.
- canonical request moves to `sourceTypes[]`; legacy scalar is compatibility input only.
- default source selection = Meeting only.
- 0 selected invalid.
- News / Assessment multi-Counterparty source is stored/resolved once, not duplicated.
- normal retrieval = Active only.
- provider/company/migration/rollout are not authorized.
- historical migration and final company rollout are deferred by current user priority.
- Work0030 Azure transition remains DEFERRED_BY_USER.

## Dispatch Table

| Dispatch ID | Purpose | Mode | Ball | Status | Instruction | Report |
|---|---|---|---|---|---|---|
| 0072-CODEX-01 | provider-disabled four-source Knowledge Search core + provenance + provider-independent Full Output subset | BUILD | CODEX | READY | `docs/handoffs/0072-CODEX-01-four-source-knowledge-core-instruction.md` | pending |

## Authorization

```text
PROVIDER_CALL_BUDGET: 0
AI_INDEX_MUTATION_BUDGET: 0
COMPANY_DATA_MUTATION_COUNT: 0
USER_NATIVE_ACTION_BUDGET: 0
APPS_SCRIPT_DEPLOYMENT_MUTATION: 0
```

## Completion Gate

CODEX-01 return後、ChatGPTがsource/filter/citation/Full Output diffとdeterministic/browser evidenceをreviewする。

Work0072をACCEPTEDにしない。

WORK_ID: 0072
DISPATCH_ID: 0072-CODEX-01
BALL: CODEX
STATUS: READY
