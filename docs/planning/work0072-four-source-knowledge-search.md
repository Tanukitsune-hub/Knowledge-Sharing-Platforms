# Work 0072 — Four-source Knowledge Search / AI layer

WORK_ID: 0072
DISPATCH_ID: N/A
BALL: NONE
STATUS: ACTIVE
MODE: BUILD
VALIDATION_TIER: TIER_2_STANDARD
ROUTE: A -> C
BASELINE: Work0071 ACCEPTED / release 0.2.2 / schema9

## Primary Outcome

Alternative Assets IntelligenceのKnowledge Search / AI source layerを、現在のMeeting / Pitchbook 2-source前提から、次の4 sourceへ一貫して拡張する。

利用者向け:

```text
面談メモ
保存資料
ニュース
評価（ICメモ、社内整理等）
```

canonical:

```text
Meeting
Pitchbook
News
Internal Assessment
```

検索対象sourceを利用者が明示選択でき、AI検索・citation/provenance・provider-neutral source resolution・Full Outputのsource scopeが同じcanonical contractを使うことを目標とする。

## User Priority — 2026-09-26

Work0071の次に必要なWorkは本Workとする。

以下は現時点では進めない。

- historical-material migration
- final company qualification / rollout
- Work0030 Azure OpenAI provider transition

これらをWork0072へ混在させない。

## Current Main Assessment

Work0071 completion後のcurrent mainでは、authoritative 4-source record layerは既に存在するが、AI / Knowledge Search layerはまだ2-source前提が残る。

### AI source constants

`KSP_AI_SOURCE_TYPES` は現在:

```text
Meeting
Pitchbook
```

のみ。

### Knowledge Search catalog / request

- catalogの `sourceTypes` はMeeting / Pitchbookのみ。
- canonical request/filterはscalar `sourceType` を前提とする。
- validatorもMeeting / Pitchbookのみを許可する。
- user UIはsingle select:
  - 面談記録・保存資料
  - 面談記録のみ
  - 保存資料のみ

### Authoritative source mapping

Knowledge Searchのauthoritative source mapsはMeeting / Pitchbookを中心に構築されている。

News / Internal AssessmentはWork0070で既に以下を持つ。

- stable ID: `NEWS-*` / `ASMT-*`
- own Index sheet
- Active / Inactive lifecycle
- source file / Google Doc
- Counterparty_IDs
- Asset Class / Fund Strategy
- AI_Document_Name
- AI_Index_Status
- AI_Content_Hash
- AI_Provider_State_JSON

したがって、record/storage schemaを追加する必要はない。

### Full Output

current UIは明示的に、

```text
面談記録のGoogle Docs全文を書き出します。保存資料の本文は含みません。
```

というMeeting中心のcontract。

Work0069で既に、Full OutputはKnowledge Searchと同じsource scopeを使い、選択したsource contentを省略しない方針がAccepted Product Decisionとなっている。

## Closed Product Decisions inherited from Work0069

### 1. Source selector

Knowledge Searchのsource selectorはsingle selectからcheckbox multi-selectへ移行する。

default:

```text
☑ 面談メモ
☐ 保存資料
☐ ニュース
☐ 評価（ICメモ、社内整理等）
```

Rules:

- 1〜4 source selected
- 0 selectedはsearch不可
- defaultは毎回Meeting only
- prior session selectionをsilent restoreしない
- checked sourceのOR
- Date / Counterparty / Asset Class等はindependent filter axis
- canonical requestは `sourceTypes[]`
- legacy scalar `sourceType` はcompatibility inputとしてのみ受ける

### 2. Provenance

AI outputは異なるprovenanceを一つの事実として平坦化しない。

Default output structure:

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

selected sourceが1つだけなら不要sectionは省略可。

Citation label examples:

```text
[面談メモ | date | Entity]
[保存資料 | title/fund | date]
[ニュース | publisher | date]
[評価 | assessment type | date]
```

Internal Assessmentは「当時の社内評価」としてprovenanceを保持する。

### 3. Multi-Entity resolution

News / Assessmentの `Counterparty_IDs` は複数可。

Provider metadataへ同じsourceをEntityごとに複製しない。

Entity / source filtersはauthoritative Indexでmatching source IDsをresolveし、provider filterへbounded source-ID setとして渡す方式を優先する。

### 4. Meeting-only filters

Team / MTG種別 / follow-up等のMeeting固有filterは、Meeting以外を同時選択した状態では曖昧なsemanticsを作らない。

Initial rule:

- Meeting-only filterを使う場合、selected sourceTypesはMeeting onlyでなければならない。
- UIは利用不可理由を明示する。
- sourceTypesを黙って変更しない。

### 5. Active-only retrieval

Normal Knowledge Search / Full OutputはActive sourceのみを対象とする。

Inactiveはprovider cleanup / lifecycle maintenanceの対象にはなり得るが、normal retrieval resultへ混ぜない。

## Required Scope

### Phase A — Canonical 4-source contract

1. `KSP_AI_SOURCE_TYPES` にNews / Internal Assessmentを追加。
2. source label registryを1か所に寄せ、user-facing labelをexact統一。
3. canonical requestを `sourceTypes[]` へ移行。
4. scalar `sourceType` compatibility adapterを維持。
5. stable ordering / unique / bounded 1–4 validation。
6. source-specific filter compatibility。
7. audit / fingerprint / retry/pending query identityへsourceTypes scopeを含める。
8. bootstrap catalogを4-source化。

### Phase B — Authoritative source maps and AI source models

1. News source map
2. Internal Assessment source map
3. multi-Counterparty relation resolution
4. Active lifecycle
5. source IDs / file IDs / Drive URLs
6. provenance metadata
7. provider document identity mapping
8. AI index status / content hash lifecycle

Build source objects without duplicating source per Counterparty.

Direct-text News / Assessment uses authoritative Google Doc text.

Uploaded News / Assessment uses existing file format/materialization registry.

### Phase C — Knowledge Search UI / filter resolution

Replace the current single source select with 4 checkboxes.

Requirements:

- default Meeting only
- 0 selected -> submit disabled + actionable validation
- selected source state is tab/session-local and not silently restored across sessions
- filter changes do not mutate source selection silently
- Meeting-only filter incompatibility is explicit
- source scope shown in pending/result state
- request fingerprint distinguishes sourceTypes

Provider-neutral pre-resolution:

```text
selected sourceTypes
+ date
+ entity/counterparty
+ asset class
+ other compatible filters
-> authoritative matching source IDs
-> provider request scope
```

### Phase D — Provider query / citations

Extend OpenAI / Gemini-neutral query contracts so 4 source identities can be retrieved and resolved.

Requirements:

- citations map back to authoritative source ID / Drive URL
- source type label shown
- ambiguous provider document identity fails closed
- unknown source type fails closed
- source from unselected source type is rejected from grounded citations
- Internal Assessment provenance remains explicitly assessment, not external fact

Provider calls are not authorized merely by implementing this logic.

### Phase E — Source-separated answer contract

Grounding/context instructions and result rendering should preserve source category.

Do not force a four-section answer when only one category has evidence.

When multiple source categories contain evidence, keep provenance separation and provide cross-source synthesis separately.

No claim that provider text will always follow section formatting exactly; server/client should still display source/citation metadata independently.

### Phase F — Full Output source parity

Full Output must use the same `sourceTypes[]` and authoritative source-ID resolution.

Required content behavior:

- Meeting: authoritative Google Doc text
- News DIRECT_TEXT: authoritative Google Doc text
- Assessment DIRECT_TEXT: authoritative Google Doc text
- uploaded News / Assessment / Pitchbook: provider-independent materialization where supported

Supported upload formats remain:

```text
.pdf
.pptx
.xlsx
.docx
.txt
.eml
```

Do not silently emit reference-only output for a selected source whose content contract requires body/content.

If a deterministic provider-independent materializer for a format is unavailable, fail explicitly with a bounded unsupported/materialization result rather than pretending Full Output parity.

Copy / Google Docs / PDF outputs use the same canonical package / fingerprint.

## Provider / Credential Boundary

Work0072 may implement provider-neutral and provider-specific code paths, tests, metadata, filters, citations, and sync selection.

It does NOT authorize:

- OpenAI/Gemini paid calls
- Vector Store / File Search Store mutation
- provider indexing of company/confidential data
- API credential creation/rotation
- Work0030 Azure activation

Default:

```text
PROVIDER_CALL_BUDGET: 0
AI_INDEX_MUTATION_BUDGET: 0
COMPANY_DATA_MUTATION_COUNT: 0
```

If live provider qualification becomes necessary, ChatGPT must create a separate Dispatch with explicit user authorization and synthetic/non-confidential data boundary.

## Migration / Rollout Boundary

Not part of Work0072:

- historical corpus migration
- company environment rollout
- company multi-user production qualification
- existing company Shared Drive mutation
- production provider indexing

These remain separate future Works.

## Data / Schema Boundary

Default expectation:

```text
SCHEMA: 9
BACKEND_SHEETS: exactly 7
NEW_SHEET: 0
MIGRATION: 0
```

Work0070 already created AI lifecycle columns for News / Assessment.

If implementation discovers a true schema blocker, STOP for Strategy Reset rather than adding an eighth sheet or silent migration.

## Release

Current baseline:

```text
0.2.2 / schema9
```

If production source changes, Work0072 uses the next patch release, expected `0.2.3`, schema9 unless a Strategy Reset proves otherwise.

## Acceptance Evidence

### Contract / source scope

- canonical 4 source types
- labels exact
- default Meeting only
- 0-source rejection
- 1–4 source unique stable normalization
- legacy scalar compatibility
- Meeting-only filter compatibility
- request fingerprint includes source scope

### Authoritative resolution

Synthetic fixtures covering all four source types:

- Active included
- Inactive excluded from normal retrieval
- multi-Counterparty News / Assessment resolves once per source
- Entity filter resolves correct IDs
- mixed source selection OR behavior
- unselected source excluded
- ambiguous provider identity fails closed

### Search / citation

With provider fakes/adapters:

- retrieved citation resolves to correct source type and stable ID
- correct Drive URL/provenance
- News publisher/date shown
- Assessment type/date shown
- source from unselected type rejected
- no source duplication per Counterparty

### Full Output

At minimum deterministic fixtures:

- Meeting direct text
- News direct text
- Assessment direct text
- TXT upload
- each additional supported binary format only if a deterministic provider-independent materializer is actually implemented
- unsupported content fails explicitly
- source sections/provenance preserved
- Copy / Docs / PDF canonical fingerprint parity

### UI

Browser:

- 1440
- 390
- 320 changed-surface smoke
- keyboard checkbox selection
- default Meeting only
- 0 selected actionable error
- source scope preserved through pending/result/export
- no material horizontal overflow
- existing Work0071 interaction-stability rules preserved

### Regression

- Work0070 4-source record layer unchanged
- Work0071 UX baseline preserved
- schema9 / 7 sheets unchanged
- provider disabled state preserved
- canonical `npm run check`
- `git diff --check`
- bundle / company 7-file parity when source changes

## Validation Strategy

Initial implementation is TIER_2_STANDARD because source/filter/UI/business contracts change but no live provider/production mutation is authorized.

Escalate only if actual provider calls, credentials, permissions, schema, migration, or production data enter scope.

Evidence hierarchy:

1. production-source deterministic source/filter/citation/materialization tests
2. production HTML browser validation
3. generated bundle/package parity
4. isolated Apps Script runtime only where Apps Script behavior itself is decision-relevant
5. live provider qualification only under explicit authorization

Do not deploy solely to manufacture evidence for pure request/filter/render logic.

## User-presence policy

```text
USER_PRESENCE_REQUIRED_BY_DEFAULT: NO
USER_NATIVE_ACTION_BUDGET: 0
```

No OS picker/native file action is expected for initial Work0072 source implementation.

## Non-Goals

- automatic news crawl/RSS/API ingestion
- Digest
- historical migration
- company rollout
- Azure OpenAI migration
- account/admin redesign
- UI rebrand
- schema10
- new backend sheet
- unrelated provider benchmarking

## Strategy Reset

Reset if:

- 4-source support requires schema change
- provider metadata limits force source duplication
- Full Output binary materialization requires an unsafe/large new runtime architecture
- sourceTypes[] breaks existing provider query compatibility in a way not solvable by bounded adapter
- live provider evidence becomes necessary before acceptance
- scope starts absorbing historical migration/company rollout

## Current State

```text
WORK0070_RECORD_LAYER: ACCEPTED
WORK0071_UX: ACCEPTED
CURRENT_RELEASE: 0.2.2
CURRENT_SCHEMA: 9
FOUR_SOURCE_STORAGE: AVAILABLE
FOUR_SOURCE_AI_SEARCH: NOT_IMPLEMENTED
HISTORICAL_MIGRATION: DEFERRED
COMPANY_ROLLOUT: DEFERRED
WORK0030_AZURE: DEFERRED_BY_USER
BLOCKER: NONE
READY_FOR_IMPLEMENTATION_DISPATCH: YES
NEXT_DISPATCH: 0072-CODEX-02
```


## Active Dispatch

`0072-CODEX-01` — provider-disabled four-source Knowledge Search core、authoritative source resolution、citation/provenance、4-source checkbox UI、provider-independent Full Output subset。

Instruction: `docs/handoffs/0072-CODEX-01-four-source-knowledge-core-instruction.md`  
Dispatch: `docs/handoffs/0072-dispatches.md`


## CODEX-01 review checkpoint

Accepted implementation/evidence:

- 4-source canonical registry and `sourceTypes[]`
- scalar compatibility
- four-source checkbox UI
- authoritative source/citation/provenance mapping
- multi-Counterparty membership without source duplication
- Active-only normal retrieval
- provider-fake matrix
- Full Output Meeting / direct News / direct Assessment / TXT / EML / XLSX
- explicit PDF / PPTX / DOCX unsupported materialization
- 1440 / 390 / 320 browser PASS
- Work0071 regression PASS
- `npm run check` 730/730 PASS

Repair required before integration:

```text
BLOCKER: PROVIDER_SOURCE_ID_LIMIT_LEAKS_INTO_FULL_OUTPUT
ROOT_CAUSE: authoritative source resolution and provider 40-ID allowlist cap are coupled
HISTORICAL_FULL_OUTPUT_THRESHOLD_CONTRACT: RESTORE
ACTIVE_DISPATCH: 0072-CODEX-02
```

The provider `KSP_KNOWLEDGE_ADVANCED_SOURCE_ID_MAX=40` limit must apply only when a provider query actually requires an explicit source-ID allowlist. Provider-independent Full Output must use its own existing limits (Meeting 50, Pitchbook 200, character limits) and preserve index-only hard-stop before body reads.
