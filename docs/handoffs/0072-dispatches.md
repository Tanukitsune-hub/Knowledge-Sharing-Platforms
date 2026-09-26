# Work 0072 dispatch control

WORK_ID: 0072
ACTIVE_DISPATCH_ID: 0072-CODEX-02
BALL: CHATGPT
STATUS: RETURNED
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
| 0072-CODEX-01 | provider-disabled four-source Knowledge Search core + provenance + provider-independent Full Output subset | BUILD | CHATGPT | RETURNED | `docs/handoffs/0072-CODEX-01-four-source-knowledge-core-instruction.md` | `docs/handoffs/0072-CODEX-01-four-source-knowledge-core-report.md` / Draft PR #106 |
| 0072-CODEX-02 | separate authoritative source scope from provider 40-ID cap and restore Full Output thresholds | BUILD | CHATGPT | RETURNED | `docs/handoffs/0072-CODEX-02-source-scope-limit-repair-instruction.md` | `docs/handoffs/0072-CODEX-02-source-scope-limit-repair-report.md` / Draft PR #106 |

## CODEX-01 ChatGPT review

Accepted:

- 4 canonical source types / shared labels
- canonical `sourceTypes[]` + scalar compatibility
- 4 checkbox UI / fresh-load Meeting-only default
- 0-source validation
- Active-only four-source authoritative mapping
- multi-Counterparty News/Assessment resolved once
- citation/provenance mapping
- provider-fake query matrix
- TXT / EML / XLSX Full Output materialization
- PDF / PPTX / DOCX explicit unsupported-materialization hard-stop
- responsive browser 1440 / 390 / 320
- Work0071 coupled regressions
- release 0.2.3 / schema9 direction

BLOCKER:

`kspRestrictKnowledgeEligibleSources_()` applies the provider-oriented `KSP_KNOWLEDGE_ADVANCED_SOURCE_ID_MAX = 40` cap to provider-independent Full Output. This changes the accepted Full Output threshold contract. The PR also changed the historical 51-Meeting test from successful preview hard-stop to `AI_ADVANCED_FILTER_TOO_BROAD`, which is not accepted.

CODEX-02 candidateで修復し、ChatGPT final diff/evidence review待ち。historical Full Output thresholdとprovider queryの分離結果はCODEX-02 reportを参照。

## Authorization

```text
PROVIDER_CALL_BUDGET: 0
AI_INDEX_MUTATION_BUDGET: 0
COMPANY_DATA_MUTATION_COUNT: 0
USER_NATIVE_ACTION_BUDGET: 0
APPS_SCRIPT_DEPLOYMENT_MUTATION: 0
```

## Completion Gate

CODEX-02 return後、ChatGPTがscope-limit修復とexact distribution evidenceをreviewする。

Work0072をACCEPTEDにしない。

WORK_ID: 0072
DISPATCH_ID: 0072-CODEX-02
BALL: CHATGPT
STATUS: RETURNED
