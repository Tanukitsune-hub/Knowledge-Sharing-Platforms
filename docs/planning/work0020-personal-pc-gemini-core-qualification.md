# Work 0020 — AI Provider Core, dual File Search, and full output

WORK_ID: `0020`

Status: Planned after Work 0019

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
- 全文出力 calls no AI API and produces one canonical package for Copy / Google Docs / PDF.

Do not split provider foundation, full-output UX, and first live File Search qualification into separate Works. Implement the smallest coherent end-to-end core for all three routes in one Work.

## Why this precedes Work 0021 and migration

Work 0021 must not build advanced filters, five modes, comparison, or format parity on provider-specific assumptions that have not been observed.

Historical migration must not load material volume until both the canonical source/package contracts and the actual enabled-provider index/query/citation lifecycle are proven.

## Current-API preflight

OpenAI and Gemini APIs, File Search Stores, supported models/formats, metadata filters, pricing, retention, and polling behavior are time-sensitive.

At Work start, use current official provider documentation to record:

1. supported File Search request/response shape;
2. supported model(s) and provider-native Store/document identity;
3. exact metadata-filter syntax and limitations;
4. citation/evidence response shape;
5. supported first-slice file formats;
6. pricing, retention, rate-limit, and cleanup constraints;
7. credential and organization/project requirements.

Existing repository clients are evidence, not presumed current truth.

## Target/runtime boundary

- current private Apps Script project and existing Web App;
- personal Google environment only;
- synthetic/non-confidential sources;
- isolated OpenAI and Gemini test Stores where enabled;
- server-side credentials outside GitHub/browser/Audit/user-visible Sheets;
- bounded billing-enabled calls only;
- no company Shared Drive, confidential data, production users, or recurring trigger.

## 1. Provider-neutral contracts

Implement or consolidate:

### Canonical AI Source

Reuse the accepted source metadata and body-building path for Meeting/Pitchbook. Provider adapters must not rebuild source selection or semantic metadata independently.

### Canonical Knowledge Request

The request contains:

```text
route: OPENAI | GEMINI | FULL_EXPORT
mode
question_or_instruction
structured filters
selected entities
source scope
request fingerprint
```

### Canonical Knowledge Package

Reuse and strengthen the existing Knowledge Export path so one deterministic package feeds:

```text
コピー
Google Docs
PDF
```

All three outputs must share the same package text and fingerprint.

### Normalized result/citation

OpenAI and Gemini responses normalize to one UI model:

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

## 2. Explicit route selection

The UI displays exactly:

```text
ChatGPT | Gemini | 全文出力
```

No automatic provider router or cross-provider failover.

- if ChatGPT is selected and OpenAI is disabled/unconfigured/unavailable, return a safe ChatGPT-specific error;
- if Gemini is selected and Gemini is disabled/unconfigured/unavailable, return a safe Gemini-specific error;
- do not send data to the other provider;
- model names remain admin settings, not user choices;
- provider availability may be displayed without exposing secrets or private Store IDs.

## 3. Provider adapters

Create equivalent private adapters for:

```text
OPENAI
GEMINI
```

Each adapter owns only provider-specific behavior:

- capability/config readback;
- isolated Store create/read;
- source upsert and exact-ID removal;
- operation polling;
- metadata-filter translation;
- grounded query;
- answer/citation normalization;
- retryable/permanent error classification;
- cleanup/rebuild.

Normal-user UI, mode prompts, filter normalization, source authority, Audit redaction, and response rendering remain shared.

## 4. Independent provider state

OpenAI and Gemini derived-index states must be independently stored and read.

A source may be:

```text
OPENAI = Indexed
GEMINI = Disabled / Failed / Pending / Indexed
```

or the reverse.

Work 0020 performs one append-only schema migration while keeping exactly five Backend sheets.

Preferred implementation:

```text
AI_Provider_State_JSON
```

with a validated versioned object keyed by `OPENAI` and `GEMINI`, each containing:

```text
document/store reference
NotIndexed / Pending / Indexed / Failed
indexed_at
content_hash
safe last error
```

When the new field is blank, migrate the existing legacy Gemini-oriented `AI_*` state into the `GEMINI` entry without changing authoritative source IDs/files.

Existing legacy fields remain preserved for compatibility/evidence. Do not bulk-delete or destructively rewrite them. Exact compatibility mirroring is finalized after source inventory, but no single ambiguous state may represent both providers.

## 5. Provider settings and credentials

Server-side configuration distinguishes at least:

```text
OPENAI_ENABLED
OPENAI_VECTOR_STORE_ID
OPENAI_DEFAULT_MODEL
GEMINI_ENABLED
GEMINI_FILE_SEARCH_STORE_NAME
GEMINI_DEFAULT_MODEL
AI_SYNC_ENABLED
```

Exact key names may align with existing naming conventions.

Credentials never appear in GitHub, browser responses, Audit, export bodies, ordinary-user Sheets, or source files.

## 6. Full-output UX

Do not use a popup/modal.

When `全文出力` is selected:

1. resolve and preview the target source scope;
2. show source count, Meeting/Pitchbook split, approximate character count, and active filters;
3. place these buttons above the body:
   - `コピー`;
   - `Google Docs`;
   - `PDF`;
4. show status/error immediately below the buttons;
5. place the full-text preview at the bottom of the section/page;
6. use a fixed/bounded height with internal scrolling;
7. allow output without requiring the user to inspect or scroll through the body;
8. prove Copy, Docs, and PDF use the exact same package/fingerprint;
9. do not create a popup, alternate hidden body, or provider call.

Reuse current Knowledge Export count/character guards, preview fingerprint, source integrity, Docs/PDF creation, and safe links where correct.

## 7. Shortest provider qualification slice

Use exactly one existing/synthetic Meeting and one synthetic Pitchbook/source first.

For every enabled provider:

1. read back provider capability and isolated Store identity;
2. index the Meeting;
3. run one grounded question and map citation to stable source ID/Drive URL;
4. index the Pitchbook;
5. run one exact entity/source metadata filter;
6. update one synthetic source and re-index without duplicate active document;
7. inactivate and prove normal retrieval exclusion;
8. reactivate and prove retrieval restoration;
9. delete/rebuild the derived provider document by exact identity;
10. record latency, polling, retry, rate-limit, cost, and retention evidence.

For an intentionally disabled provider:

- select the route once;
- prove a safe provider-specific error;
- prove no request was sent to the other provider;
- do not treat the disabled provider as live-qualified.

## 8. Full-output qualification slice

Using the same source scope:

1. generate the canonical package once;
2. verify source count/character count/scope summary;
3. verify buttons appear above the preview;
4. verify the preview is at the bottom and internally scrollable;
5. copy once;
6. create one Google Doc;
7. create one PDF;
8. verify package fingerprints/text parity across Copy/Docs/PDF;
9. verify no AI API call occurred;
10. clean up only explicitly authorized test artifacts.

## 9. Indexing lifecycle and isolation

For each provider independently:

### Registration

- authoritative source save succeeds first;
- provider state becomes Pending;
- AI failure never rolls back source capture;
- bounded direct/private handler indexes current content.

### Update

- content hash controls re-index;
- replace/supersede the current provider document;
- no duplicate active document per provider/source.

### Inactivation / Reactivation

- Inactive excludes/removes source from normal provider retrieval;
- reactivation indexes the latest authoritative content.

### Rebuild

- provider Store documents may be deleted/rebuilt by exact source identity;
- Drive source and Index identity remain unchanged.

## 10. Audit and redaction

Allowed bounded Audit metadata:

```text
provider route
mode
structured filter IDs
configured model alias
result
cited stable source IDs
safe error code/message
```

Do not store questions, generated answers, retrieved chunks, source bodies, raw provider payloads, credentials, embeddings, uploaded bytes, or private Store identifiers.

Full-output Copy/Docs/PDF retains the existing bounded export Audit contract; the source package itself is not duplicated into Audit.

## 11. Logic validation

- provider-neutral request/source/package/citation contracts;
- provider selection and no-failover behavior;
- provider capability and safe errors;
- independent provider state migration/serialization;
- current OpenAI/Gemini request/response mapping;
- metadata filter escaping/exactness;
- state transitions/retry/idempotency/content hash;
- no duplicate active provider document;
- citation mapping to stable source identity/Drive link;
- full-output package parity and UI order/internal scroll;
- safe error/redaction/secret handling;
- no question/answer/body duplication into Audit;
- public surface;
- `npm run check` and `git diff --check`.

## 12. Target-runtime qualification and completion

Mocks/fixtures/CI are insufficient for enabled provider routes.

Report separately:

```text
OPENAI_RUNTIME: PASS | DISABLED_BY_CONFIG | FAIL | NOT RUN
GEMINI_RUNTIME: PASS | DISABLED_BY_CONFIG | FAIL | NOT RUN
FULL_OUTPUT_RUNTIME: PASS | FAIL | NOT RUN
```

Overall Work 0020 completion requires:

- provider-neutral core and migration PASS;
- full-output route PASS;
- at least one File Search provider live PASS;
- every enabled provider in this environment live PASS;
- every deliberately disabled provider safe-error/no-failover PASS;
- final source/Index/Store/Audit/credential/trigger integrity PASS;
- no company production-readiness claim.

Target both OpenAI and Gemini live PASS when approved credentials are available. A provider deliberately disabled by configuration is an accepted residual capability state, not silent substitution.

## 13. Side effects

Expected:

```text
APPLICATION_DATA_SIDE_EFFECT_STATE: GUARDED only for append-only provider-state migration
PROVIDER_STORE_SIDE_EFFECT_STATE: TEST_ONLY
EXPORT_ARTIFACT_SIDE_EFFECT_STATE: TEST_ONLY
DEPLOYMENT_SIDE_EFFECT_STATE: GUARDED
```

No recurring trigger, confidential data, production Store, broad user access, or destructive source mutation.

## 14. Non-goals

- advanced full filter matrix;
- all five modes end-to-end on every format;
- 2–5 entity comparison;
- all six formats in the first core slice;
- automatic provider selection/failover;
- user-facing model selector;
- full-context API route as a substitute for File Search;
- custom Vector DB/embedding service;
- company production rollout.

Those expand in Work 0021 or final production qualification.

## Completion latch

```text
DEV QUALIFIED — WORK 0020 AI PROVIDER CORE
LOGIC_VALIDATION: PASS
TARGET_RUNTIME_QUALIFICATION: PASS under the enabled-provider matrix
FULL_OUTPUT_RUNTIME: PASS
READY: YES for personal-PC provider core
BLOCKER: NO
```
