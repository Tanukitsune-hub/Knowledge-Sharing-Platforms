# Work 0020 — AI Provider Core, dual File Search, and full output

WORK_ID: `0020`

Status: Current after accepted Work 0019

Mode: `BUILD / QUALIFICATION` with bounded repair allowed

Authoritative decision:

`docs/decisions/ai-provider-selection-and-full-output.md`

Provider-neutral architecture:

`docs/ai/provider-neutral-file-search.md`

## Primary outcome

Deliver and qualify one provider-neutral Knowledge Search core in the current private/personal-PC environment with exactly three user-facing routes:

```text
ChatGPT
Gemini
全文出力
```

- ChatGPT uses OpenAI File Search;
- Gemini uses Gemini File Search;
- 全文出力 calls no AI API and produces one canonical full-text package for Copy / Google Docs / PDF.

Do not split provider foundation, full-output UX, schema/state migration, and first live File Search qualification into separate Works.

## Current official API preflight — 2026-08-28

The implementation must re-check official docs at execution time, but the current observed contracts are:

### OpenAI

- Responses API uses the `file_search` tool with `vector_store_ids`;
- files are attached to Vector Stores and become queryable when vector-store file status is `completed`;
- file-search filters operate on Vector Store file attributes;
- supported comparison operators include exact/in-style filters;
- response message annotations expose `file_citation` with provider file identity/filename;
- Vector Store file attributes are limited to **16 key-value pairs per file**;
- first-slice safe native formats include `.txt` and `.pdf`; `.docx` and `.pptx` are also supported, while `.xlsx` is not in the current OpenAI File Search supported-format list.

### Gemini

- Interactions API uses a `file_search` tool with `file_search_store_names`;
- File Search Store documents persist until deleted; temporary Files API uploads have separate retention behavior;
- custom metadata supports provider-native `metadata_filter`;
- `file_citation` annotations can include custom metadata and page information where available;
- current File Search model support includes Flash-family models;
- current supported formats include PDF, Office Word/PowerPoint/Excel MIME types and text formats;
- current per-document limit is 100 MB.

Do not hard-code a model solely because it appears in an example. Use one approved/current supported model per enabled provider and keep model choice administrator-side.

## Metadata budget and source resolution

OpenAI's 16-attribute cap is a hard design constraint. Therefore provider File Search metadata is intentionally compact and stable-ID-first.

Core provider metadata should normally remain within this set:

```text
source_type
source_id
date_key
entity_key
counterparty_type
gp_id
asset_class_id
capital_type_id
team_id
fund_strategy
follow_up_required
```

Do not spend provider metadata slots on display names, Drive URLs, filenames, content hashes, or duplicated human-readable labels when those can be resolved from authoritative Backend rows using `source_id`.

Canonical AI Source may contain richer metadata internally, but the provider-index projection is a smaller contract.

Work 0021 may implement complex filters such as Related GP / Meeting Type by first resolving exact stable source IDs from Backend and then using bounded provider-native source-ID filtering/retrieval. Do not encode comma-separated lists and treat substring matching as exact metadata filtering.

## Target/runtime boundary

- current private Apps Script project and same existing private Web App;
- personal Google environment only;
- synthetic/non-confidential sources;
- isolated OpenAI and Gemini test Stores where enabled;
- credentials server-side only, outside GitHub/browser/Audit/user-visible Sheets/export bodies;
- bounded billing-enabled calls only;
- no company Shared Drive, confidential data, production users, or recurring trigger.

## Schema and provider state

Work 0020 increments Backend schema exactly once from `5` to `6`.

Append exactly one provider-state column to both `Meeting_Index` and `Pitchbook_Index`:

```text
AI_Provider_State_JSON
```

Keep exactly five Backend sheets.

The field is a validated/versioned object keyed by:

```text
OPENAI
GEMINI
```

Each provider state may contain only safe derived state such as:

```text
status: NotIndexed | Pending | Indexed | Failed
document_ref
indexed_at
content_hash
safe_last_error
```

Existing legacy Gemini-oriented `AI_*` columns remain preserved. When provider state is blank, migrate compatible legacy state into the `GEMINI` entry without changing authoritative source IDs/files. Do not bulk-delete or destructively rewrite legacy fields.

OpenAI and Gemini states are independent. A single ambiguous index status/document reference may not represent both providers.

## Provider settings and credentials

Server-side/provider configuration distinguishes at least:

```text
OPENAI_ENABLED
OPENAI_VECTOR_STORE_ID
OPENAI_DEFAULT_MODEL
GEMINI_ENABLED
GEMINI_FILE_SEARCH_STORE_NAME
GEMINI_DEFAULT_MODEL
AI_SYNC_ENABLED
```

Use existing Settings/Script Property conventions where safe. Store secrets only in the established server-side secret boundary and never expose secret values in reports, logs, PRs, browser responses, Sheets, Audit, or chat.

No automatic provider failover.

## Provider-neutral contracts

Implement or consolidate one shared set of contracts:

### Canonical AI Source

Authoritative source identity, body representation, and rich semantic metadata. Provider adapters consume this; they do not independently decide what a Meeting/Pitchbook means.

### Canonical Knowledge Request

```text
route: OPENAI | GEMINI | FULL_EXPORT
mode
question_or_instruction
structured filters
selected entities
source scope
request fingerprint
```

### Provider index projection

Maps Canonical AI Source to the compact metadata budget and provider upload representation.

### Canonical Knowledge Package

One deterministic full-text package feeding:

```text
コピー
Google Docs
PDF
```

All three outputs share identical package text and fingerprint.

### Normalized result/citation

```text
provider
answer
citations[]
source_type
source_id
display_name
drive_url
safe evidence location where available
```

Provider citation IDs must be mapped back to stable authoritative source IDs before rendering.

## Full-output semantic contract

`全文出力` means full text, not metadata-only handoff.

- Meeting includes authoritative Google Doc body text;
- a Pitchbook/source is counted as fully included only when its full readable text can be deterministically extracted for this route;
- do not silently substitute Pitchbook metadata + Drive link and still label the result `全文出力`;
- if selected sources include a format whose body cannot yet be fully extracted in Work 0020, return a clear blocking/unsupported-format state rather than a partial package presented as complete;
- Work 0020 must qualify at least one Meeting plus one fully extractable Pitchbook/source (prefer `.txt`; bounded PDF is acceptable if extraction is already production-safe);
- Work 0021 expands full-output extraction to the accepted six-format matrix.

## Full-output UX

Do not use a popup/modal.

When `全文出力` is selected:

1. resolve target scope;
2. build the canonical package once;
3. show source count, Meeting/Pitchbook split, approximate character count, and active scope summary;
4. place these buttons above the body:
   - `コピー`;
   - `Google Docs`;
   - `PDF`;
5. show status/error directly below the buttons;
6. place the full-text preview at the bottom of the section/page;
7. use a fixed/bounded height with internal scrolling;
8. allow Copy/Docs/PDF without scrolling through or reading the body;
9. prove Copy/Docs/PDF consume the exact same package/fingerprint;
10. do not create a popup, alternate hidden package body, or AI provider call.

Reuse existing Knowledge Export source guards, preview fingerprint, Docs/PDF creation, and safe links only where they remain semantically correct.

## Provider adapters

Create equivalent private adapters for:

```text
OPENAI
GEMINI
```

Each adapter owns only provider-specific behavior:

- capability/config readback;
- isolated Store create/read;
- source upsert and exact-ID removal;
- operation/status polling;
- compact metadata projection/translation;
- grounded File Search query;
- citation normalization;
- retryable/permanent error classification;
- cleanup/rebuild.

Normal-user UI, route selection, mode prompts, source authority, filter normalization, Audit redaction, and result rendering remain shared.

## Explicit route selection

UI displays exactly:

```text
ChatGPT | Gemini | 全文出力
```

- ChatGPT selected + OpenAI unavailable/disabled/unconfigured -> safe ChatGPT-specific error;
- Gemini selected + Gemini unavailable/disabled/unconfigured -> safe Gemini-specific error;
- do not send source/question to the other provider;
- provider availability may be shown without exposing secrets or Store IDs;
- no normal-user model selector.

## Shortest provider qualification slice

Use exactly one existing/synthetic Meeting and one fully extractable synthetic Pitchbook/source first.

For every enabled provider:

1. read back provider capability and isolated Store identity;
2. index the Meeting;
3. run one grounded question and map citation back to stable source ID/Drive URL;
4. index the Pitchbook/source;
5. run one exact `entity_key` or `source_id` metadata filter;
6. update one synthetic source and re-index without duplicate active provider document;
7. inactivate and prove normal retrieval exclusion;
8. reactivate and prove retrieval restoration;
9. delete/rebuild the derived provider document by exact identity;
10. record observed latency, polling, retry/rate-limit behavior, cost, retention, and cleanup route.

For a deliberately disabled provider:

- select the route once;
- prove safe provider-specific error;
- prove zero cross-provider failover;
- do not call it live-qualified.

## Full-output qualification slice

Using the same bounded source scope:

1. generate canonical package once;
2. verify source count/character count/scope summary;
3. prove body contains actual Meeting + fully extractable Pitchbook/source text;
4. verify buttons appear above preview;
5. verify preview is bottom-positioned and internally scrollable;
6. copy once;
7. create one Google Doc;
8. create one PDF;
9. verify package fingerprint/text parity across Copy/Docs/PDF;
10. verify no OpenAI/Gemini API call occurred;
11. clean up only explicitly authorized test artifacts.

## Indexing lifecycle and isolation

For each provider independently:

### Registration/update

- authoritative source save succeeds first;
- provider state is derived and may become Pending/Failed independently;
- AI/provider failure never rolls back source capture;
- content hash controls re-index;
- no duplicate active provider document per provider/source.

### Inactivation/reactivation

- Inactive source is excluded/removed from normal provider retrieval;
- reactivation restores latest authoritative content.

### Rebuild

- provider Store documents may be deleted/rebuilt by exact provider/source identity;
- Drive source and stable Index identity remain unchanged.

No recurring trigger in Work 0020. Use bounded private/direct sync handlers only.

## Audit and redaction

Allowed bounded metadata:

```text
provider route
mode
structured filter IDs
configured model alias
result
cited stable source IDs
safe error code/message
```

Do not store questions, answers, retrieved chunks, source bodies, full-output body, raw provider payloads, credentials, embeddings, uploaded bytes, or private Store identifiers.

## Logic validation

- schema 5 -> 6 append-only/idempotent migration;
- provider-state migration/serialization and independent states;
- provider-neutral source/request/index-projection/package/citation contracts;
- OpenAI 16-attribute budget enforcement;
- explicit selection and no-failover behavior;
- current OpenAI/Gemini request/response mapping;
- exact metadata filtering/escaping;
- retry/idempotency/content hash/no duplicate active provider document;
- citation mapping to stable source/Drive link;
- full-output truly contains full source bodies for claimed included sources;
- unsupported full-output format fails clearly rather than producing a partial package;
- package parity and UI order/internal scroll;
- secret/error/Audit redaction;
- public surface;
- temporal validator;
- `npm run check`;
- `git diff --check`.

## Target-runtime qualification and completion

Mocks/fixtures/CI are insufficient for enabled provider routes.

Report separately:

```text
OPENAI_RUNTIME: PASS | DISABLED_BY_CONFIG | FAIL | NOT RUN
GEMINI_RUNTIME: PASS | DISABLED_BY_CONFIG | FAIL | NOT RUN
FULL_OUTPUT_RUNTIME: PASS | FAIL | NOT RUN
```

Overall Work 0020 completion requires:

- provider-neutral core and schema 6 migration PASS;
- FULL_OUTPUT_RUNTIME PASS;
- at least one File Search provider live PASS;
- every provider enabled in this environment live PASS;
- every deliberately disabled provider safe-error/no-failover PASS;
- final source/Index/Store/Audit/credential/trigger/deployment integrity PASS;
- no company production-readiness claim.

Target both OpenAI and Gemini live PASS when approved credentials are available. `DISABLED_BY_CONFIG` is an explicit residual capability state, not silent substitution.

## Side effects

Expected:

```text
APPLICATION_DATA_SIDE_EFFECT_STATE: GUARDED only for append-only schema/provider-state migration and bounded synthetic lifecycle
PROVIDER_STORE_SIDE_EFFECT_STATE: TEST_ONLY
EXPORT_ARTIFACT_SIDE_EFFECT_STATE: TEST_ONLY
DEPLOYMENT_SIDE_EFFECT_STATE: GUARDED
```

No recurring trigger, confidential data, production Store, broad user access, physical authoritative-source delete, or company production rollout.

## Strategy reset conditions

Reset rather than repeating the same failure if:

- official provider API contradicts the assumed Store/filter/citation contract;
- OpenAI attribute cap cannot support the compact metadata contract;
- stable citation -> source mapping is not deterministic;
- provider index lifecycle cannot avoid duplicate active documents;
- full-output body extraction cannot truthfully meet the `全文出力` semantic contract for the first supported slice;
- same live-provider failure persists after one materially different bounded repair;
- target deployment identity is ambiguous.

Preserve accepted evidence from unaffected routes during reset.

## Non-goals

- advanced full filter matrix;
- all five modes end-to-end on every format;
- 2–5 entity comparison;
- all six formats in the first core slice;
- automatic provider selection/failover;
- user-facing model selector;
- full-context API route replacing File Search;
- custom Vector DB/embedding service;
- company production rollout.

Those expand in Work 0021 or final production qualification.

## Completion latch

```text
DEV QUALIFIED — WORK 0020 AI PROVIDER CORE
LOGIC_VALIDATION: PASS
TARGET_RUNTIME_QUALIFICATION: PASS under enabled-provider matrix
FULL_OUTPUT_RUNTIME: PASS
READY: YES for personal-PC provider core
BLOCKER: NO
```
