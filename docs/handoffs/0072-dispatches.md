# Work 0072 dispatch control

WORK_ID: 0072
ACTIVE_DISPATCH_ID: 0072-CODEX-03
BALL: CHATGPT
STATUS: RETURNED
MODE: QUALIFICATION
VALIDATION_TIER: TIER_3_HIGH
PHASE: LIVE_PROVIDER_QUALIFICATION
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
- 今回のCODEX-03はisolated synthetic provider qualificationのみ承認済み。会社data/provider、migration、rolloutは未承認。
- historical migration and final company rollout are deferred by current user priority.
- Work0030 Azure transition remains DEFERRED_BY_USER.

## Dispatch Table

| Dispatch ID | Purpose | Mode | Ball | Status | Instruction | Report |
|---|---|---|---|---|---|---|
| 0072-CODEX-01 | provider-disabled four-source Knowledge Search core + provenance + provider-independent Full Output subset | BUILD | CHATGPT | RETURNED | `docs/handoffs/0072-CODEX-01-four-source-knowledge-core-instruction.md` | `docs/handoffs/0072-CODEX-01-four-source-knowledge-core-report.md` / Draft PR #106 |
| 0072-CODEX-02 | separate authoritative source scope from provider 40-ID cap and restore Full Output thresholds | BUILD | CHATGPT | RETURNED | `docs/handoffs/0072-CODEX-02-source-scope-limit-repair-instruction.md` | `docs/handoffs/0072-CODEX-02-source-scope-limit-repair-report.md` / PR #106 |
| 0072-CODEX-03 | bounded live provider four-source qualification with synthetic data | QUALIFICATION | CHATGPT | RETURNED | `docs/handoffs/0072-CODEX-03-live-provider-four-source-qualification-instruction.md` | `docs/handoffs/0072-CODEX-03-live-provider-four-source-qualification-report.md` |

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

CODEX-02 candidateで修復し、当時ChatGPT final diff/evidence reviewへ返した。historical Full Output thresholdとprovider queryの分離結果はCODEX-02 reportを参照。

## CODEX-01/02 authorization（履歴）

```text
PROVIDER_CALL_BUDGET: 0
AI_INDEX_MUTATION_BUDGET: 0
COMPANY_DATA_MUTATION_COUNT: 0
USER_NATIVE_ACTION_BUDGET: 0
APPS_SCRIPT_DEPLOYMENT_MUTATION: 0
```

## Completion Gate

PR #106の4-source coreとCODEX-02修復はChatGPT reviewでmainへ統合済み。CODEX-03の再preflightでは両provider credentialの設定を確認したが、安全なisolated provider Storeとexact cleanup経路を確立できず、live provider matrixは未実行。provider-runtime acceptanceはChatGPTの次判断待ち。

Work0072をACCEPTEDにしない。

WORK_ID: 0072
DISPATCH_ID: 0072-CODEX-03
BALL: CHATGPT
STATUS: RETURNED


## Core integration

ChatGPT final core review: PASS.

```text
PR: #106
MERGE: 309040b2f834c1964283c52740f4ea84a2d6442a
RELEASE: 0.2.3
SCHEMA: 9
FOUR_SOURCE_CORE: INTEGRATED
LOGIC_VALIDATION: PASS
NPM_RUN_CHECK: 734/734 PASS
PROVIDER_CALL_COUNT: 0
AI_INDEX_MUTATION_COUNT: 0
APPS_SCRIPT_DEPLOYMENT: 0
COMPANY_DATA_MUTATION_COUNT: 0
USER_NATIVE_ACTION_COUNT: 0
CORE_BLOCKER: NONE
```

Accepted core includes canonical `sourceTypes[]`, 4 checkbox UI, authoritative source resolution, multi-Counterparty membership, Active-only retrieval, citation/provenance, fake-provider query contracts, Full Output parity for supported deterministic formats, unsupported PDF/PPTX/DOCX fail-closed behavior, and separation of provider 40-ID limits from Full Output limits.

## CODEX-03 authorization and remaining boundary

Work0072 overall is not yet ACCEPTED because live provider qualification for the new four-source path has not run.

2026-09-26に、既存のisolated/test credentialだけを使用するbounded synthetic qualificationが承認された。初回preflightでは対象credentialが未設定だったが、同Dispatch再実行時の現行targetではDirect OpenAI / Geminiの設定を確認した。安全なStore境界とexact cleanup経路が未証明のため、callとmutationは開始していない。次の実行境界はChatGPTが判断する。

Authorization state:

```text
LIVE_PROVIDER_QUALIFICATION: AUTHORIZED_2026-09-26
PROVIDER_CALLS: BOUNDED_SYNTHETIC_AUTHORIZED
AI_INDEX_MUTATION: BOUNDED_SYNTHETIC_AUTHORIZED
COMPANY_DATA: NOT_AUTHORIZED
HISTORICAL_MIGRATION: DEFERRED
COMPANY_ROLLOUT: DEFERRED
WORK0030_AZURE: DEFERRED_BY_USER
```

User authorized bounded synthetic live-provider qualification. Dispatch `0072-CODEX-03`の再実行では、現行isolated Apps Script targetのScript PropertiesにDirect OpenAI / Geminiのkey項目を確認した。OpenAI既存Storeのtest-only帰属・内容とGemini通常Storeの安全な作成・cleanup経路が未証明のため、`SAFE_ISOLATED_PROVIDER_STORE_PATH_UNPROVEN`でQ1〜Q4は`NOT_RUN`。provider call、index、source sync、version、deployment updateは各0。詳細はCODEX-03 reportを参照。会社/機密dataは引き続き対象外。
