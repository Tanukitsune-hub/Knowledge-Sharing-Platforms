# Work 0021 — Structured Knowledge Search filters and multi-entity comparison

WORK_ID: `0021`

Status: Planned after Work 0020

Mode: `BUILD / QUALIFICATION`

## Primary outcome

Expand the qualified personal-PC Gemini/File Search core into the intended five-mode Knowledge Search with structured entity filters and AI-based multi-entity comparison.

This Work replaces the need for a separate static GP-comparison dashboard.

## Dependency

Work 0020 must prove the actual current API, Store, model, credential, metadata-filter, citation, update, and cleanup contracts first.

Do not implement advanced filters against an assumed API shape that has not transferred to the target runtime.

## Structured filters

Target filter set:

```text
Date From / To
Counterparty Type
Counterparty Entity
Related GP (subject to observed multi-value metadata capability)
Asset Class
Equity / Debt
Team
Fund / Strategy
Meeting Type
要フォロー
Source Type
```

Behavior:

- `未選択` means no filter and is omitted;
- entity selection uses stable composite `entity_key`;
- inactive Master values remain available for historical filtering when needed;
- Fund / Strategy remains free text in source data; filter UX should use exact distinct values or another behavior proven safe by actual data, not fuzzy silent normalization;
- Meeting-only filters exclude Pitchbooks unless the query explicitly broadens source scope;
- every visible filter is reflected in Audit metadata without recording question/source bodies.

## Multi-entity comparison

Comparison mode allows explicit selection of 2–5 entities.

Entities may be from different categories, for example:

```text
GP: KKR
LP / Asset Owner: New York Life
日本生命: a selected department
```

Required output:

- direct comparison by common dimensions;
- compact table where useful;
- supported similarities/differences;
- changes over time when evidence exists;
- unresolved/evidence gaps;
- citations attributable to each compared entity;
- no invented symmetry where one entity has less evidence.

## Retrieval strategy decision after Work 0020

Use the simplest strategy supported by actual File Search behavior:

1. one grouped OR metadata filter over `entity_key`; or
2. bounded separate retrieval per entity followed by one grounded synthesis call.

Do not encode comma-separated ID lists and pretend substring matching is exact metadata filtering.

If Related GP requires multi-value matching not supported reliably by the API, use a bounded alternative such as separate filtered retrieval or defer that one filter with an explicit limitation. Do not weaken exactness silently.

## Five modes

Qualify all accepted modes on the same retrieval/citation layer:

```text
自由質問
要約
時系列
比較
面談準備
```

Mode-specific prompts/templates change presentation, not source authority or access boundaries.

## Format expansion

After the core source path passes, qualify the accepted initial formats using bounded synthetic files:

```text
.pdf
.pptx
.xlsx
.docx
.txt
.eml
```

For `.eml`:

- preserve original source;
- index normalized headers/body;
- do not auto-index embedded attachments;
- verify citation/source traceability.

Do not add `.msg` unless a separate decision changes scope.

## Metadata contract

Expected single-valued metadata includes:

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
```

Meeting Type should use exact-filterable values proven in Work 0020/0021, potentially dedicated boolean metadata per accepted type rather than one comma string.

Display names supplement stable IDs but do not replace them.

## UI

- dependent Counterparty Type -> Entity selector;
- searchable multi-select for comparison entities;
- clear chips/summary of active filters;
- preset modes remain simple;
- comparison mode clearly requires multiple targets;
- citations show entity/source identity and Drive link;
- empty/insufficient evidence state is explicit.

## Audit

Append bounded structured filter fields to the separate Audit schema as needed.

Do not store:

- question/additional instruction text under the current redaction policy;
- generated answers;
- retrieved chunks;
- source bodies;
- credentials;
- raw provider payloads.

## Shortest target-runtime slice

1. one entity-filtered free question;
2. one 2-entity comparison using actual metadata filtering/retrieval;
3. verify citations for both entities;
4. one Team/Meeting Type/follow-up filter;
5. run each remaining mode once on bounded synthetic scope;
6. validate each source format in a bounded matrix;
7. final Store/Index/Audit/source integrity and cost summary.

## Logic validation

- filter normalization/validation;
- OR/separate-retrieval strategy contract;
- exact stable-ID filters;
- mode prompt/output contracts;
- per-entity citation grouping;
- insufficient-evidence behavior;
- audit redaction;
- format normalization;
- no duplicate index documents;
- public surface;
- `npm run check` and `git diff --check`.

## Non-goals

- static GP comparison screen;
- autonomous investment recommendations;
- public-web enrichment in the same request;
- custom vector database/Knowledge Graph;
- model selector/Deep mode;
- production company rollout;
- confidential source indexing before final production authorization.

## Completion latch

```text
LOGIC_VALIDATION: PASS
TARGET_RUNTIME_QUALIFICATION: PASS
SIDE_EFFECT_STATE: TEST_ONLY / bounded billing-enabled calls
READY: YES for personal-PC five-mode search
BLOCKER: NO
```
