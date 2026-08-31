# Work 0021 — Structured Knowledge Search, five modes, and multi-entity comparison

WORK_ID: `0021`

Status: BLOCKED at CODEX-01 target-runtime qualification

CODEX-01 implemented the canonical core filters and five-mode OpenAI/FULL_OUTPUT contracts and passed deterministic validation. The first version-61 OpenAI compound-filter query returned no retrievable source/citation, so the dispatch stopped before remaining live gates. A fresh dispatch must reconcile exact designated-source row metadata with current provider attributes before the smallest bounded requalification; do not weaken exact filters or broaden sync.

Mode: `BUILD / QUALIFICATION`

Authoritative decision:

`docs/decisions/ai-provider-selection-and-full-output.md`

Provider-neutral architecture:

`docs/ai/provider-neutral-file-search.md`

## Primary outcome

Expand the qualified Work 0020 core into the intended Knowledge Search product while preserving exactly three user-facing routes:

```text
ChatGPT
Gemini
全文出力
```

Deliver:

- structured filters;
- all five accepted modes;
- 2–5 Entity comparison;
- provider-parity behavior for every enabled API route;
- full-output parity using the same filters/modes/source scope;
- bounded six-format qualification;
- grounded citations and authoritative Drive traceability.

This Work replaces a separate static GP-comparison dashboard.

## Dependency

Work 0020 must first prove:

- provider-neutral source/request/package/citation contracts;
- independent OpenAI/Gemini provider state;
- actual enabled-provider File Search Store/index/query/citation lifecycle;
- explicit provider selection and no-failover errors;
- full-output Copy/Docs/PDF parity and internal-scroll UX;
- current metadata-filter limitations.

Do not reopen provider architecture or implement filters against an assumed API shape.

Work 0025 must also complete the administrator-governed model/thinking registry, normal-user selectors, and server-side effective-policy resolver. Work 0021 extends that request contract for filters, modes, comparison, and format coverage; it must not add a competing selector or bypass the Work 0025 resolver.

## 1. Unified UI and route behavior

Knowledge Search keeps one conditions/mode form and one explicit generation selector:

```text
ChatGPT | Gemini | 全文出力
```

### ChatGPT / Gemini

- use the selected provider's qualified File Search adapter;
- show answer and normalized citations;
- do not send data to the other provider;
- show a safe provider-specific error if disabled/unavailable;
- preserve the Work 0025 administrator-governed model/thinking selectors and resolve every choice through its server-side effective-policy contract.

### 全文出力

- applies the exact same mode, filters, selected entities, and source scope;
- calls no AI API;
- shows source/character summary;
- places `コピー / Google Docs / PDF` above the body;
- places the fixed-height internally scrollable preview at the bottom;
- uses the exact same canonical package across all outputs.

Do not maintain separate filter forms or mode definitions by route.

## 2. Structured filters

Target filter set:

```text
Date From / To
Counterparty Type
Counterparty Entity
Related GP
Asset Class
Equity / Debt
Team
Fund / Strategy
Meeting Type
要フォロー
Source Type
```

Rules:

- `未選択` means no filter and is omitted;
- Entity uses exact stable `entity_key`;
- Inactive Master values remain selectable for historical filtering where appropriate;
- Fund / Strategy uses exact distinct trimmed values; no fuzzy silent normalization;
- Meeting-only filters exclude Pitchbooks unless source scope intentionally includes compatible sources;
- Related GP and Meeting Type use only exact provider behavior proven in Work 0020/0021;
- comma-separated substring matching is never treated as exact;
- the canonical filter model is provider-neutral;
- each provider adapter translates the same filter contract or returns an explicit unsupported-capability error;
- full output resolves the same filters directly against authoritative records.

## 3. Multi-entity comparison

Comparison mode allows explicit selection of 2–5 Entities across categories, for example:

```text
GP: KKR
LP / Asset Owner: New York Life
日本生命: a selected department
```

Required output for ChatGPT and Gemini:

- common-dimension comparison;
- compact comparison table where useful;
- supported similarities/differences;
- change over time where evidence exists;
- evidence gaps and asymmetry;
- citations attributable to each Entity;
- no invented symmetry when one Entity has less evidence.

Full output produces one deterministic comparison package grouped by selected Entity and source, with the same mode instruction and scope summary for use in an external approved AI.

## 4. Provider retrieval strategy

For each enabled provider, use the simplest exact strategy proven by Work 0020:

1. grouped/OR metadata filter over stable `entity_key`; or
2. bounded separate retrieval per Entity followed by one grounded synthesis request.

Correctness, evidence coverage, citation attribution, and stable source identity outrank one-call elegance.

A provider may use a different internal retrieval strategy while returning the same normalized product contract. The UI does not expose those implementation differences.

If exact Related GP or Meeting Type filtering cannot be represented safely for one provider, use bounded separate retrieval or return a clear limitation. Do not silently weaken the filter.

## 5. Five modes

Qualify all modes on the shared source/filter/citation layer:

```text
自由質問
要約
時系列
比較
面談準備
```

Mode templates change instruction/output structure only. Source authority, access boundary, provider selection, filter semantics, citation mapping, and Audit redaction remain unchanged.

### 自由質問

Direct grounded answer, evidence, uncertainty/insufficient-evidence state, citations.

### 要約

Cross-source synthesis, major themes/facts/viewpoints, changes/contradictions, concise takeaways, citations.

### 時系列

Dated chronology, supported change/continuity, evidence gaps, citations by period.

### 比較

2–5 Entity comparison with per-Entity citation attribution and evidence asymmetry.

### 面談準備

Entity-scoped recent updates, changes, unresolved topics, reconfirmation points, questions, citations.

## 6. Format expansion

After the core provider paths pass, qualify bounded synthetic files:

```text
.pdf
.pptx
.xlsx
.docx
.txt
.eml
```

The canonical source adapter owns metadata/source identity. Provider adapters may use provider-native upload or a canonical normalized representation where required, but source traceability must remain identical.

For `.eml`:

- preserve the original source;
- index normalized Subject/From/To/Cc/Date/Body;
- do not auto-index embedded attachments;
- material attachments remain separate registered sources;
- `.msg` remains out of scope.

Provider-specific unsupported formats return explicit status and must not invalidate the authoritative Drive record or the full-output route.

## 7. Metadata contract

Expected provider-neutral metadata includes:

```text
source_type
source_id
date_key
entity_key
counterparty_type
counterparty_id
counterparty_name
gp_id
asset_class_id
capital_type_id
team_id
fund_strategy
follow_up_required
drive_url
saved_filename
content_hash
```

Meeting Type and Related GP may require dedicated exact-filterable metadata or bounded separate retrieval. Exact representation is fixed from observed API capability.

Display names supplement stable IDs but never replace them.

## 8. Result and citation UX

### API routes

Show:

- selected provider label;
- answer;
- insufficient-evidence/limitation note;
- normalized citation list;
- source Entity/type/date/display name;
- authoritative Drive link;
- cited source count and omitted/truncated indicators where applicable.

### Full output

Show:

```text
scope/source/character summary
[ コピー ] [ Google Docs ] [ PDF ]
status
fixed-height internally scrollable preview at bottom
```

Users do not need to inspect the body before output.

## 9. Audit

Append only the bounded structured metadata required for the new filters/routes.

Allowed:

```text
provider route
mode
structured filter IDs
selected Entity stable keys
effective model profile ID and thinking profile ID
result
cited stable source IDs
safe error/limitation code
```

Do not store questions/additional instructions under the current redaction policy, answers, chunks, source bodies, full-output body, credentials, raw provider payloads, embeddings, or private Store IDs.

## 10. Shortest target-runtime campaign

Use bounded synthetic/non-confidential scope.

1. one Entity-filtered free question on ChatGPT if enabled;
2. the same bounded question/filter on Gemini if enabled;
3. verify normalized citations and Drive links for each enabled provider;
4. one 2-Entity comparison on each enabled provider;
5. verify citations attributable to both Entities;
6. one Team / Meeting Type / follow-up filter;
7. run each remaining mode once on bounded scope;
8. generate the same selected scope through `全文出力` and verify summary/buttons/preview/package parity;
9. qualify the six-format matrix for every enabled provider to the extent supported, recording explicit provider differences;
10. verify disabled-provider error/no-failover behavior where applicable;
11. final provider Store/Index/Audit/source/settings/credential/trigger integrity and cost summary.

## 11. Provider parity contract

Report separately:

```text
OPENAI_SEARCH_MATRIX
GEMINI_SEARCH_MATRIX
FULL_OUTPUT_MATRIX
```

For every provider enabled in the environment:

- all five modes must pass on the bounded core sources;
- structured Entity/date/source filters must pass;
- comparison must pass;
- citation mapping must pass;
- provider-specific limitations must be explicit.

A deliberately disabled provider must continue to show its safe error and no failover. It is not considered live-qualified.

The product contract is shared; identical prose is not required between providers.

## 12. Logic validation

- shared route/mode/filter model;
- provider-specific filter translation;
- exact stable-ID semantics;
- OR/separate-retrieval strategy;
- five-mode prompt/output contracts;
- per-Entity citation grouping;
- insufficient-evidence behavior;
- full-output package parity and UI placement;
- Audit redaction;
- format normalization/traceability;
- no duplicate provider index documents;
- disabled-provider no-failover behavior;
- public surface;
- `npm run check` and `git diff --check`.

## 13. Side effects and boundary

Expected:

```text
PROVIDER_STORE_SIDE_EFFECT_STATE: TEST_ONLY
EXPORT_ARTIFACT_SIDE_EFFECT_STATE: TEST_ONLY
APPLICATION_DATA_SIDE_EFFECT_STATE: GUARDED only for provider-derived state
DEPLOYMENT_SIDE_EFFECT_STATE: GUARDED
```

No company confidential data, production users/Stores, recurring triggers, public-web enrichment, or production rollout.

## 14. Non-goals

- static GP comparison screen;
- automatic provider routing/failover;
- a competing model/thinking selector, raw model-ID path, or bypass of the Work 0025 effective-policy resolver;
- full-context API route replacing File Search;
- autonomous investment recommendations;
- public-web enrichment in the same request;
- custom Vector DB/Knowledge Graph;
- production company rollout;
- confidential source indexing before final authorization.

## Completion latch

```text
DEV QUALIFIED — WORK 0021 STRUCTURED KNOWLEDGE SEARCH
LOGIC_VALIDATION: PASS
TARGET_RUNTIME_QUALIFICATION: PASS under the enabled-provider matrix
OPENAI_SEARCH_MATRIX: PASS or DISABLED_BY_CONFIG
GEMINI_SEARCH_MATRIX: PASS or DISABLED_BY_CONFIG
FULL_OUTPUT_MATRIX: PASS
READY: YES for personal-PC intended search product
BLOCKER: NO
```
