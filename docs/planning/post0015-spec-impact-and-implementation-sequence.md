# Post-0015 Specification Impact and Implementation Sequence

Current as of: 2026-08-28

Status: Active cross-cutting implementation review

This document records how the accepted roadmap changes source/schema/UI/search/AI contracts and why the Works are ordered as defined in `docs/planning/mvp-and-roadmap.md`.

Later accepted decisions supersede earlier Gemini-only wording:

- `docs/decisions/ai-provider-selection-and-full-output.md`;
- `docs/ai/provider-neutral-file-search.md`.

## 1. Accepted foundation now in place

- Backend remains exactly five sheets;
- schema 5 currently includes Counterparty Entity and monthly admin-check fields;
- Work 0016 replaced global Meeting GP requirement with Counterparty Type -> Entity;
- Work 0022 established the temporal contract;
- Work 0017 delivered Activity Analytics;
- Work 0018 delivered explicit bidirectional Relationship Explorer;
- Work 0019 delivers Entity Workspace / Fund Strategy;
- Pitchbook remains GP-owned;
- canonical relationship remains `Meeting_Index.Related_Pitchbook_IDs`;
- Knowledge Export already resolves authoritative sources and can produce Copy/Docs/PDF-derived content;
- current AI code is Gemini-oriented but already has useful canonical source metadata.

## 2. Selected post-0019 AI contract

| Earlier assumption | Accepted contract | Work |
|---|---|---|
| Gemini is the only API route | User explicitly selects ChatGPT, Gemini, or 全文出力 | 0020 |
| One Store/model/state is sufficient | OpenAI and Gemini Stores/config/index state are independent | 0020 |
| API unavailable may require a fallback | No automatic cross-provider failover; provider-specific safe error | 0020 |
| Knowledge Export is a separate secondary surface | Full output becomes one of three normal generation routes | 0020 |
| Copy/Docs/PDF may be separate actions | All consume one canonical package/fingerprint | 0020 |
| Long prompt preview may be hidden/popup-like | Buttons above body; preview at bottom with bounded internal scroll | 0020 |
| Filters/modes are Gemini-specific | One provider-neutral request/filter/mode model serves all routes | 0020/0021 |
| Gemini comparison is the qualitative route | Selected ChatGPT or Gemini may run comparison; full output packages it externally | 0021 |
| One provider matrix is enough | OpenAI, Gemini, and full-output matrices are reported separately | 0020/0021 |

## 3. Persistent data impact

### Existing authoritative business schema

Keep:

```text
GP_Master
Option_Master
Meeting_Index
Pitchbook_Index
Settings
```

Do not add a provider-state sheet/database.

### Work 0020 provider state

OpenAI and Gemini derived state must be independently observable.

Preferred append-only field:

```text
AI_Provider_State_JSON
```

Versioned object keyed by:

```text
OPENAI
GEMINI
```

Per-provider state:

```text
document/store reference
NotIndexed / Pending / Indexed / Failed
indexed_at
content_hash
safe last error
```

When new state is blank, migrate existing legacy Gemini-oriented `AI_*` fields into `GEMINI`. Preserve legacy columns for compatibility/evidence; do not destructively remove them.

Exact compatibility mirroring is finalized after the Work 0020 source inventory. A single generic status may not be treated as the state of both providers.

### Settings

Work 0020 separates at least:

```text
OPENAI_ENABLED
OPENAI_VECTOR_STORE_ID
OPENAI_DEFAULT_MODEL
GEMINI_ENABLED
GEMINI_FILE_SEARCH_STORE_NAME
GEMINI_DEFAULT_MODEL
AI_SYNC_ENABLED
```

Exact names may align with existing conventions. Credentials never live in user-visible Sheets, GitHub, browser responses, Audit, or exports.

## 4. Production source impact matrix

### Core/setup/schema

Likely areas:

```text
src/00_Core.gs
src/10_Setup.gs
setup/migration/diagnostic tests
```

Changes:

- schema increment once for provider state;
- append-only migration;
- safe provider-specific errors;
- settings preservation/readback;
- provider capability diagnostics without secrets/private Store IDs.

### Canonical AI source

Likely areas:

```text
src/130_AiConstants.gs
src/131_AiFileSearchContracts.gs
src/132_AiKnowledgeContracts.gs
src/140_AiSourceModels.gs
```

Changes:

- rename/generalize Gemini-specific contracts where needed;
- keep one source metadata/body path;
- keep stable `source_id`, `entity_key`, date, Entity/GP, Asset Class, Team, Fund/Strategy, Meeting Type, follow-up, Drive link, filename, content hash;
- do not duplicate source construction by provider.

### Provider adapters

Likely new/private boundaries:

```text
OpenAI File Search adapter
Gemini File Search adapter
provider capability/state adapter
normalized citation adapter
```

Each owns Store/index/query/filter/citation/polling/retry/cleanup only.

No normal-user model selector and no provider-specific duplicate UI.

### AI sync worker

Current Gemini-oriented sync must evolve to:

```text
provider-neutral work selection
→ selected/enabled provider state
→ provider adapter
→ independent success/failure
```

Authoritative source save remains independent. One provider failure does not roll back capture or overwrite the other provider state.

### Knowledge Search UI

Current separate search/export sections converge to:

```text
conditions + mode
route selector: ChatGPT / Gemini / 全文出力
execute
result surface determined by route
```

API routes show answer/citations. Full output shows summary, buttons, status, and bottom fixed-height internal-scroll body.

There is no popup/modal for long output.

### Knowledge Export

Reuse:

- Active source resolution;
- count/character limits;
- source integrity and authoritative links;
- preview fingerprint/staleness protection;
- Google Docs/PDF creation;
- copy contract;
- Audit redaction.

Strengthen to one canonical package/fingerprint shared by Copy/Docs/PDF. Do not maintain hidden alternative bodies.

### Knowledge filters/modes

Work 0021 adds the same provider-neutral filters and modes to all routes.

Provider adapters translate exact metadata semantics. If one provider cannot represent an exact multi-value filter, use bounded separate retrieval or return an explicit limitation—never substring weakening.

### Audit

Append bounded provider route/model alias/filter/Entity/result/cited-source metadata only where required.

Do not store question/instruction, answer, chunks, source/full-output body, raw provider payloads, credentials, embeddings, bytes, or private Store IDs.

## 5. Compatibility strategy

- stable Meeting/Document/Batch/Master/File IDs remain unchanged;
- Shared Drive sources remain authoritative;
- existing Gemini-oriented fields remain preserved during append-only migration;
- existing Knowledge Export Docs/PDF behavior remains available while the UI is unified;
- existing five modes retain their instruction intent;
- existing normal-user public functions remain compatible where practical;
- no provider selection changes Meeting/Pitchbook authoritative records;
- full output remains usable even when APIs are disabled, subject to source/output permissions and limits;
- disabled API routes return safe errors and do not silently invoke another provider.

## 6. Correct Work order

```text
Entity Workspace foundation
→ provider-neutral AI core + both File Search adapters + full output
→ advanced filters / five modes / multi-Entity / provider parity
→ historical migration
→ final company production qualification
```

Why:

- Entity identity, relationships, and Fund/Strategy context must be stable before AI filters/comparison;
- provider adapters and state must be proven before advanced UX;
- full output should reuse the same canonical request/scope before filters multiply;
- migration waits until index/metadata/filter/citation contracts are observed;
- company permissions/credentials/users remain the last environment-specific qualification.

## 7. Work 0020 qualification gate

- current official OpenAI/Gemini API contracts recorded;
- three-choice UI;
- no failover;
- provider-neutral source/request/package/citation contracts;
- independent provider state migration;
- full output PASS;
- at least one File Search provider live PASS;
- every enabled provider live PASS;
- deliberately disabled provider safe-error/no-failover PASS;
- one Meeting/Pitchbook index/query/citation/filter/update/inactivate/reactivate/delete/rebuild per enabled provider;
- Copy/Docs/PDF exact package parity;
- buttons above body and bottom internal-scroll preview;
- cost/retry/rate-limit/retention and final integrity.

## 8. Work 0021 qualification gate

- same shared route/mode/filter UI;
- exact Entity filter;
- same bounded query on every enabled provider;
- normalized citations/Drive links;
- 2–5 Entity comparison and per-Entity evidence;
- Team/Meeting Type/follow-up filters;
- all five modes;
- full-output parity for the same filter/mode scope;
- bounded six-format matrix;
- separate `OPENAI_SEARCH_MATRIX`, `GEMINI_SEARCH_MATRIX`, `FULL_OUTPUT_MATRIX`;
- final Store/Index/Audit/source/cost integrity.

## 9. Risk and resolution register

### Provider capability mismatch

Risk: metadata filters, formats, citations, polling, or retention differ.

Resolution: one product contract with provider-specific adapters and explicit limitations. Product correctness outranks identical internal calls.

### Silent data movement

Risk: automatic failover sends data to an unintended provider.

Resolution: no automatic failover; explicit provider choice and safe errors.

### Ambiguous provider state

Risk: one `AI_Index_Status` masks divergent OpenAI/Gemini state.

Resolution: independent provider-state object and migration.

### Full-output divergence

Risk: Copy, Docs, and PDF contain different bodies.

Resolution: one canonical package/fingerprint consumed by all outputs.

### Long-output usability

Risk: page becomes extremely long or users must scroll before exporting.

Resolution: buttons above body; preview at bottom with bounded height/internal scroll.

### Multi-value exact filtering

Risk: provider API encourages comma substring matching.

Resolution: dedicated exact metadata, grouped filters, bounded separate retrieval, or explicit limitation. Never claim substring exactness.

### Cost and Store duplication

Risk: indexing both providers doubles derived cost/state.

Resolution: explicit enable flags, independent Stores/state, bounded personal-PC campaigns, provider-level cost evidence, and company policy deciding enabled providers.

### Historical migration complexity

Risk: diverse formats make universal conversion costly/unreliable.

Resolution: manual-first; automate repeatable subsets only after provider contracts pass.

## 10. Delivery boundary

These planning updates are ChatGPT-only. They do not mutate Apps Script runtime, Backend, Audit, Drive, provider Stores, credentials, deployment, or the active Work 0019 branch.

Each implementation Work receives its own branch, Draft PR, Work/Dispatch register, exact target identity, mutation budget, logic validation, provider matrices, target-runtime qualification, report, and ChatGPT final review.
