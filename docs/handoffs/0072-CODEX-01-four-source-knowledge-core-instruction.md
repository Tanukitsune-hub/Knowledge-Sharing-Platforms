# Work 0072 CODEX-01 — Four-source Knowledge Search core

WORK_ID: 0072
DISPATCH_ID: 0072-CODEX-01
BALL: CODEX
STATUS: READY
MODE: BUILD
VALIDATION_TIER: TIER_2_STANDARD
USER_NATIVE_ACTION_BUDGET: 0
USER_PRESENCE_REQUIRED_BY_DEFAULT: NO

## Goal

Work0070 / Work0071で完成した4-source authoritative record layerとUX baselineの上に、Knowledge Search / AI source layerのcanonical scopeをMeeting / Pitchbook / News / Internal Assessmentへ拡張する。

CODEX-01では、live provider callなしで以下を一つのcoherent vertical sliceとして完成させる。

1. canonical `sourceTypes[]` contract
2. 4-source authoritative source maps / source models
3. 4-source Knowledge Search checkbox UI
4. provider-neutral source-ID pre-resolution
5. citation / provenance mapping
6. provider-fake query pathでの4-source grounded-result contract
7. Full Outputでprovider-independentにmaterializeできる4-source content path
8. binary materialization gapの明示的なfail-closed handling

Do not start historical migration, company rollout, or Work0030 Azure provider transition.

## Read First

1. nearest `AGENTS.md`
2. `docs/planning/work0072-four-source-knowledge-search.md`
3. `docs/planning/work0069-source-aware-knowledge-expansion-plan.md`
4. `docs/product/source-aware-knowledge-expansion.md`
5. `docs/handoffs/0071-completion-report.md`
6. `docs/decisions/target-runtime-first-development.md`
7. current AI/Search/Export production source and directly coupled tests

Do not copy durable AGENTS rules into new source comments/handoffs.

## Baseline / Closed Conclusions

```text
WORK0070_RECORD_LAYER: ACCEPTED
WORK0071_UX: ACCEPTED
BASE_RELEASE: 0.2.2
SCHEMA: 9
BACKEND_SHEETS: exactly 7
AI_SYNC: disabled unless already explicitly enabled by accepted environment state
PROVIDER_CALL_BUDGET: 0
AI_INDEX_MUTATION_BUDGET: 0
COMPANY_DATA_MUTATION_COUNT: 0
USER_NATIVE_ACTION_BUDGET: 0
```

Preserve:

- Meeting `MTG-*`
- Pitchbook `DOC-*`
- News `NEWS-*`
- Assessment `ASMT-*`
- Active / Inactive lifecycle
- Work0070 retry/idempotency/concurrency contract
- Work0071 interaction-stability contract
- schema9 / exactly seven Backend sheets
- existing provider-disabled behavior
- existing audit fail-soft behavior

## Canonical source registry

Extend `KSP_AI_SOURCE_TYPES` to exactly:

```text
Meeting
Pitchbook
News
Internal Assessment
```

Create/reuse one source descriptor/label registry so user-facing labels are exact:

```text
Meeting              -> 面談メモ
Pitchbook            -> 保存資料
News                 -> ニュース
Internal Assessment  -> 評価（ICメモ、社内整理等）
```

Do not scatter duplicate label literals where a shared registry can serve them safely.

## Phase A — sourceTypes[] contract

Canonical request uses:

```js
sourceTypes: ["Meeting", ...]
```

Rules:

- normalize to stable canonical source order
- unique only
- 1–4 items
- 0 selected -> explicit validation error
- unknown value -> fail closed
- legacy scalar `sourceType` remains accepted as compatibility input
- canonical output/request/fingerprint/audit uses `sourceTypes[]`
- legacy scalar is not the new internal source of truth
- default UI state is Meeting only
- prior-session selection is not silently restored

Meeting-only filters:

- Team
- MTG種別
- follow-up
- legacy related-GP compatibility where still accepted

These are valid only when canonical `sourceTypes[]` is exactly `["Meeting"]`.

Do not silently alter source selection to make an incompatible filter valid.

## Phase B — authoritative 4-source source maps

Extend authoritative source mapping/model code to include News and Internal Assessment.

### News

Map at minimum:

- sourceType = News
- sourceId = NEWS-*
- sourceFileId / Drive URL
- Published_Date
- Title
- Publisher
- canonical Counterparty_IDs
- Asset_Class_ID
- Fund_Strategy
- Input_Mode
- Source_Mime_Type
- Original/Saved filename
- Status
- AI_Document_Name
- AI_Content_Hash
- AI_Provider_State_JSON

### Internal Assessment

Map at minimum:

- sourceType = Internal Assessment
- sourceId = ASMT-*
- sourceFileId / Drive URL
- Assessment_Date
- Title
- Assessment_Type + label
- Decision_Or_Action
- canonical Counterparty_IDs
- related Meeting / Document / News IDs as provenance metadata
- Asset_Class_ID
- Fund_Strategy
- Input_Mode
- Source_Mime_Type
- Original/Saved filename
- Status
- AI_Document_Name
- AI_Content_Hash
- AI_Provider_State_JSON

### Multi-Counterparty rule

A News/Assessment source with multiple `Counterparty_IDs` is still ONE source.

Do not duplicate provider/source-map rows per Counterparty.

Authoritative filter resolution tests must prove that an Entity match returns that source once.

### Lifecycle

Normal retrieval / Full Output:
- Active only

Provider cleanup/lifecycle maintenance may still inspect Inactive when required by existing sync logic, but normal user retrieval excludes it.

## Phase C — source work-item / AI source build

Extend source work-item and source building paths so News / Assessment can participate in derived AI source identity without altering authoritative records.

Direct-text:
- authoritative Google Doc text
- stable source ID
- provenance metadata

Uploaded:
- use current shared upload format registry
- do not invent a parallel file-format registry

If existing AI sync code is too tightly coupled to Meeting/Pitchbook and a clean four-source implementation would require provider calls or a schema change, stop for Strategy Reset rather than introducing unsafe duplication.

Provider calls remain 0.

## Phase D — provider-neutral source resolution

Before provider query, resolve scope authoritatively.

Concept:

```text
sourceTypes[]
+ date
+ Counterparty/Entity
+ Asset Class
+ compatible filters
-> matching authoritative source IDs
-> provider request scope
```

Requirements:

- OR across selected source types
- AND with independent axes such as date/entity/asset class
- Meeting-only filters only under Meeting-only selection
- multi-Counterparty News/Assessment match by membership
- selected-source ordering does not affect fingerprint
- same normalized selection yields same fingerprint
- unselected source IDs never enter resolved scope
- Active-only
- duplicate source IDs removed
- bounded result set / existing provider filter limits remain fail-closed

Do not duplicate provider documents to solve Entity membership.

## Phase E — Knowledge Search UI

Replace current single `knowledge-sourceType` select with four source checkboxes.

Default:

```text
☑ 面談メモ
☐ 保存資料
☐ ニュース
☐ 評価（ICメモ、社内整理等）
```

UI requirements:

- keyboard-operable
- 0 selected -> AI検索 button disabled or client validation prevents submit with actionable message
- source selection displayed clearly in pending/result scope
- Meeting-only filter incompatibility is explained
- do not silently clear checked sources
- default returns to Meeting only on fresh load/new session
- no cross-session source-selection restore
- preserve Work0071 stable-action/focus/layout behavior
- 1440 / 390 / 320 changed-surface fit

Use the current product terminology: `面談メモ`, not legacy `面談記録`, wherever this Work changes the source selector/citation/output UI.

## Phase F — citations / provenance

Extend provider-neutral citation mapping for all four source types.

Each mapped citation must include authoritative:

- sourceType
- sourceId
- Drive/source URL
- date
- source label
- source-specific provenance summary

Examples:

```text
面談メモ: date + Counterparty
保存資料: title/fund + date
ニュース: publisher + date
評価: assessment type + date
```

Fail closed when:

- provider document identity is ambiguous
- source type is unknown
- source is Inactive
- source type was not selected
- provider citation cannot map to one authoritative source

Internal Assessment must be labeled as assessment/internal view, not external fact.

## Phase G — fake-provider query contract

Provider calls are prohibited, but query/citation logic must be exercised with provider fakes/adapters.

Test at minimum:

- Meeting only
- News only
- Assessment only
- Pitchbook only
- Meeting + News
- all four
- Entity filter matching a multi-Counterparty News source once
- provider returns citation from unselected source -> rejected/warning/fail-closed per existing contract
- ambiguous document identity -> fail closed
- normalized source order -> stable request fingerprint
- scalar `sourceType` compatibility

Do not weaken existing grounding/citation rules.

## Phase H — Full Output parity, provider-independent subset

Full Output must consume the same canonical `sourceTypes[]` / resolved authoritative source IDs as Knowledge Search.

CODEX-01 must fully support provider-independent materialization for formats/routes already deterministic in repository/runtime without adding a large new dependency.

Minimum required in CODEX-01:

- Meeting Google Doc text
- News DIRECT_TEXT Google Doc text
- Assessment DIRECT_TEXT Google Doc text
- TXT upload
- EML only if current code already has deterministic extraction support
- source-separated sections/provenance
- canonical package/fingerprint shared across preview/copy/Docs/PDF

For PDF/PPTX/XLSX/DOCX and any other binary route:

1. inspect current repository/runtime for existing deterministic provider-independent extraction.
2. if already present, reuse it and test it.
3. if not present, do NOT fake parity, silently omit, or send to provider.
4. return an explicit bounded `UNSUPPORTED_MATERIALIZATION` / equivalent hard-stop for selected content that cannot be materialized.
5. record the exact missing formats and cheapest next architecture in the report.

Do not add a heavy parser/conversion architecture in CODEX-01 unless it is already an existing project capability.

## Source-separated answer contract

Update provider prompt/context or result metadata as needed so multi-source requests preserve provenance.

For multiple source categories with evidence, intended semantic structure is:

```text
面談メモ
保存資料
ニュース
評価（ICメモ、社内整理等）
横断整理
  - 一致
  - 相違 / 食い違い
  - 追加確認事項
  - 次回面談論点
```

Do not depend solely on model compliance for provenance. Citation/source metadata rendered by the app remains authoritative.

If only one source type has evidence, do not force empty sections.

## Release / distribution

If production source changes:

```text
TARGET_RELEASE: 0.2.3
TARGET_SCHEMA: 9
```

- no migration
- no new Backend sheet
- production source freeze before distribution generation
- deterministic bundle
- exact source commit
- exact bundle file hash
- exact payload hash
- independent company package BASIS pin
- seven-file raw parity

Do not publish a GitHub Release or deploy to company production.

## Expected source areas

Likely, not mandatory:

- `src/130_AiConstants.gs`
- `src/140_AiSourceModels.gs`
- `src/150_KnowledgeSearchModels.gs`
- `src/151_KnowledgeSearchService.gs`
- `src/152_KnowledgeFilterContracts.gs`
- provider-neutral citation/filter adapters
- `src/155_KnowledgeExportContracts.gs`
- `src/156_KnowledgeExportService.gs`
- `src/157_KnowledgeExportLiveEnvironment.gs`
- source-record environment/context loaders
- `src/ClientKnowledgeSearch.html`
- `src/KnowledgeSearchPage.html`
- focused tests
- generated distribution

Do not modify unrelated surfaces to fit this list.

## Authorization Boundary

Allowed:

- repository source/tests/docs/generated artifacts
- local production-HTML browser tests
- synthetic deterministic source fixtures
- fake provider adapters/responses
- local bundle/package generation

Not allowed:

- live OpenAI/Gemini calls
- provider index/store writes
- API key creation/rotation
- company/confidential data
- company Apps Script/Drive/Sheets mutation
- historical migration
- company rollout
- Work0030 Azure reactivation
- schema change
- new Backend sheet
- permission/access changes
- user-native action

```text
PROVIDER_CALL_BUDGET: 0
AI_INDEX_MUTATION_BUDGET: 0
COMPANY_DATA_MUTATION_COUNT: 0
USER_NATIVE_ACTION_BUDGET: 0
```

## Validation

Focused first.

### Contract

- 4 source constants/labels
- sourceTypes[] normalization
- 0/unknown/duplicate handling
- scalar compatibility
- Meeting-only filter compatibility
- fingerprint/audit scope

### Source resolution

Fixtures for all four source types:
- Active included
- Inactive excluded
- multi-CP source resolves once
- source OR behavior
- independent filter AND behavior
- unselected source excluded

### Citation

- all four authoritative mappings
- selected-source enforcement
- ambiguous identity fail closed
- provenance label/detail

### Full Output

- Meeting
- News direct
- Assessment direct
- TXT upload
- any existing deterministic format materializer
- explicit unsupported selected binary
- section/provenance
- preview/copy/Docs/PDF fingerprint parity

### Browser

- 1440
- 390
- 320 smoke
- keyboard checkbox selection
- default Meeting only
- 0 selected actionable error
- Meeting-only filter conflict
- mixed-source scope display
- Full Output scope display
- Work0071 layout/focus regression
- horizontal overflow 0

### Canonical

After final material source change:

```text
python tools/validate_agent_foundation.py
npm run check
git diff --check
```

Bundle/package parity when source changes.

## Target Runtime

Do not deploy merely to prove pure request/filter/render logic.

CODEX-01 target-runtime mutation budget:

```text
APPS_SCRIPT_SOURCE_SYNC: 0
IMMUTABLE_VERSION_CREATE: 0
DEPLOYMENT_UPDATE: 0
PROVIDER_CALLS: 0
```

If a specific Apps Script-only behavior becomes decision-relevant and cannot be tested deterministically, stop and return it as a concrete next-step question for ChatGPT. Do not create/recover a target automatically.

## Execution Budget

- one coherent 4-source contract, no parallel legacy implementation
- speculative architecture attempts per blocker class: max 2
- source contract redesign after implementation starts: max 1 Strategy Reset
- canonical full check: once after focused validation, rerun only after material source fix
- provider attempts: 0
- deployment attempts: 0
- user-native actions: 0

## Strategy Reset

STOP and return to ChatGPT if:

- schema9 cannot represent required 4-source AI state
- an eighth Backend sheet appears necessary
- source duplication per Counterparty appears necessary
- provider metadata/filter limits require a new persistence model
- Full Output binary parity would require a substantial new parsing/conversion architecture
- live provider calls appear necessary to establish logic correctness
- company data/migration/rollout begins entering scope
- legacy scalar compatibility cannot be preserved without corrupting canonical semantics

Do not silently broaden scope.

## Phase boundary / delivery

CODEX-01 should implement the coherent provider-disabled 4-source core and report any remaining binary-materialization/provider-runtime gaps.

Do not mark Work0072 ACCEPTED.

Branch:

`work/0072-four-source-knowledge-search`

Open one Draft PR.

Report:

`docs/handoffs/0072-CODEX-01-four-source-knowledge-core-report.md`

Update branch copy:

`docs/handoffs/0072-dispatches.md`

## Required report fields

```text
CANONICAL_SOURCE_TYPES
SOURCE_TYPES_NORMALIZATION
LEGACY_SOURCE_TYPE_COMPAT
AUTHORITATIVE_SOURCE_RESOLUTION
MULTI_COUNTERPARTY_RESOLUTION
ACTIVE_ONLY_RETRIEVAL
KNOWLEDGE_SEARCH_UI
MEETING_ONLY_FILTER_COMPAT
CITATION_PROVENANCE
FAKE_PROVIDER_QUERY_MATRIX
FULL_OUTPUT_MEETING
FULL_OUTPUT_NEWS_DIRECT
FULL_OUTPUT_ASSESSMENT_DIRECT
FULL_OUTPUT_TXT
FULL_OUTPUT_BINARY_SUPPORT
UNSUPPORTED_MATERIALIZATION
RESPONSIVE_1440
RESPONSIVE_390
RESPONSIVE_320
WORK0071_UX_REGRESSION
LOGIC_VALIDATION
BUNDLE_VALIDATION
MULTIFILE_PACKAGE_PARITY
TARGET_RUNTIME_QUALIFICATION
PROVIDER_CALL_COUNT
AI_INDEX_MUTATION_COUNT
COMPANY_DATA_MUTATION_COUNT
USER_NATIVE_ACTION_COUNT
BLOCKER
FOLLOW_UP
READY
```

## Mandatory final identity

```text
WORK_ID: 0072
DISPATCH_ID: 0072-CODEX-01
BALL: CHATGPT
STATUS: RETURNED
```

If Strategy Reset is triggered, keep the same Dispatch ID and return `BALL: CHATGPT / STATUS: BLOCKED` with the accepted evidence and cheapest next decisive action.

WORK_ID: 0072
DISPATCH_ID: 0072-CODEX-01
BALL: CODEX
STATUS: READY
