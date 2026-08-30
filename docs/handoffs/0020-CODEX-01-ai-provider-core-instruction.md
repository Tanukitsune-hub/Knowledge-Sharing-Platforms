# Work 0020 — CODEX-01 AI Provider Core

WORK_ID: `0020`
DISPATCH_ID: `0020-CODEX-01`
BALL: `CODEX`
STATUS: `READY`
MODE: `BUILD / QUALIFICATION`
ROUTE: `C`
RECOMMENDED_MODEL: `Sol High`

Repository: `Tanukitsune-hub/Knowledge-Sharing-Platforms`
Branch: `agent/0020-ai-provider-core`
Draft PR: assigned after setup
Exact execution ref: supplied in the ChatGPT dispatch prompt after final activation metadata commit.

## Read first

Read every applicable `AGENTS.md` / `AGENTS.override.md`, then:

1. `docs/handoffs/0020-instruction.md`;
2. `docs/planning/work0020-personal-pc-gemini-core-qualification.md`;
3. `docs/decisions/ai-provider-selection-and-full-output.md`;
4. `docs/ai/provider-neutral-file-search.md`;
5. accepted Work 0019 report;
6. current AI/Search/Export source, especially `src/130_*` through `src/170_*`, `src/155_*` through `src/157_*`, Knowledge Search UI, setup/schema/settings, public-surface tests;
7. current official OpenAI and Google Gemini File Search documentation before changing provider request mappings.

Architecture is mostly settled; current provider API details are not assumed from historical repository code.

## Current official preflight facts to verify, not blindly hard-code

OpenAI current official documentation shows:

- Responses API tool `file_search` with `vector_store_ids`;
- Vector Store file status must reach `completed` before use;
- file attributes are used for metadata filtering;
- a Vector Store file supports at most 16 attributes;
- file-search response message annotations expose `file_citation` with provider file identity/filename;
- `.txt`, `.pdf`, `.docx`, `.pptx` are currently supported; `.xlsx` is not currently listed for OpenAI File Search.

Gemini current official documentation shows:

- Interactions API tool `file_search` with `file_search_store_names`;
- custom metadata + `metadata_filter`;
- `file_citation` annotations, custom metadata, and page number where available;
- current Flash-family File Search support;
- PDF, Word, PowerPoint, Excel, and broad text MIME support;
- 100 MB/document current File Search limit;
- Store data and temporary raw File uploads have different retention semantics.

Record the actual current documentation facts used in the report. If official docs changed materially, adjust the provider adapter while preserving the product contract.

## Primary outcome

Build and qualify one normal-user Knowledge Search surface with exactly:

```text
ChatGPT
Gemini
全文出力
```

- ChatGPT -> OpenAI File Search;
- Gemini -> Gemini File Search;
- 全文出力 -> no AI API, one canonical full-text package -> Copy / Google Docs / PDF.

Do not split into separate provider Works.

## 1. Schema/provider-state migration

Increment `KSP_SCHEMA_VERSION` exactly once from `5` to `6`.

Append exactly one column to both `Meeting_Index` and `Pitchbook_Index`:

```text
AI_Provider_State_JSON
```

Do not add a sixth Backend sheet.
Do not delete/reorder legacy columns.
Preserve all existing `AI_*` fields.

Implement a versioned parser/serializer/validator for provider state keyed by:

```text
OPENAI
GEMINI
```

Each state supports safe derived fields only:

```text
status: NotIndexed | Pending | Indexed | Failed
document_ref
indexed_at
content_hash
safe_last_error
```

When new provider-state field is blank, migrate compatible legacy Gemini state into `GEMINI` once/idempotently. Do not invent OpenAI state from Gemini fields.

Schema/setup/readback must be idempotent. No authoritative source ID/file mutation.

## 2. Compact provider metadata projection

Canonical AI Source remains rich and provider-neutral.

Provider-index metadata is a compact projection. Enforce the OpenAI hard ceiling of 16 file attributes.

Normal core projection should stay within:

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

Do not use provider metadata slots for:

```text
display names
Drive URLs
filenames
content hashes
duplicated human-readable labels
```

Resolve those after retrieval from authoritative Backend by stable `source_id`.

Tests must fail if the OpenAI projection exceeds 16 attributes.

## 3. Canonical request/result contracts

Create/consolidate one provider-neutral request:

```text
route: OPENAI | GEMINI | FULL_EXPORT
mode
question_or_instruction
filters
selected_entities
source_scope
request_fingerprint
```

For Work 0020, preserve the existing accepted mode behavior but only the shortest bounded search path must be live-qualified. Do not implement Work 0021 comparison/filter expansion.

Normalize API provider result to:

```text
provider
answer
citations[]
```

Each normalized citation must resolve to:

```text
source_type
source_id
display_name
drive_url
safe evidence location where available
```

Do not trust provider filename as authoritative identity. Map provider document/file identity and/or custom metadata back to stable `source_id`, then resolve authoritative details from Backend.

## 4. OpenAI provider adapter

Add a private OpenAI adapter behind the shared provider interface.

Own only:

- enabled/config/credential presence readback without revealing secrets;
- isolated Vector Store create/read when authorized;
- file upload/attach/status poll;
- stable source -> provider document reference;
- compact attributes;
- Responses API File Search query;
- metadata filters;
- citation normalization;
- exact provider-document removal;
- retry/error classification;
- cleanup/rebuild.

No browser API key. No key in Settings/Audit/report/logs/GitHub/chat.

Use one current supported admin-configured model. Do not add a user model selector.

## 5. Gemini provider adapter

Refactor existing Gemini-specific code behind the same provider interface rather than preserving a divergent product stack.

Use current Interactions/File Search Store contracts if that is the current official API.

Own only the same provider-specific responsibilities as OpenAI.

Preserve exact citation -> stable source mapping and provider-specific cleanup.

Do not combine File Search with unrelated grounding tools in this Work.

## 6. Explicit provider selection and safe availability

Knowledge Search UI displays exactly:

```text
ChatGPT | Gemini | 全文出力
```

No `Auto` option.
No automatic cross-provider failover.
No normal-user model selector.

Availability readback may say provider enabled/disabled/ready but must not return secret values, private Store IDs, or credentials.

If selected ChatGPT is disabled/unconfigured/unavailable:

- return ChatGPT-specific safe error;
- do not call Gemini.

If selected Gemini is disabled/unconfigured/unavailable:

- return Gemini-specific safe error;
- do not call OpenAI.

Add deterministic no-failover tests.

## 7. Full-output semantics — full means full

Strengthen existing Knowledge Export into one canonical full-text package.

A source may be counted as included only if its actual readable body is in the package.

Meeting:
- include authoritative Google Doc body.

Pitchbook/source:
- include actual deterministically extracted body for formats supported by the current slice;
- first slice must qualify one fully extractable source, preferably `.txt`;
- if a selected source format cannot yet be fully extracted, return a clear unsupported/incomplete-source error and do not present metadata/link-only output as `全文出力`.

Do not silently downgrade to link-only.

Work 0021 owns the six-format expansion.

## 8. Full-output UX

Reuse the existing Knowledge Search page rather than a popup/modal.

Flow:

```text
conditions / question
route: ChatGPT | Gemini | 全文出力
execute
```

For FULL_EXPORT result render:

```text
scope summary / source count / Meeting-Pitchbook split / char count
[ コピー ] [ Google Docs ] [ PDF ]
status/error
...
full-text preview at bottom
```

Requirements:

- three action buttons are ABOVE the full-text body;
- full-text body is at the bottom of section/page;
- fixed/bounded preview height with internal scroll;
- user can Copy/Docs/PDF without reading/scrolling through body;
- Copy/Docs/PDF use the same exact package string and package fingerprint;
- no hidden alternate body generation;
- no OpenAI/Gemini call from FULL_EXPORT.

## 9. Provider-aware lifecycle

Authoritative capture must remain independent of AI indexing.

For each enabled provider independently:

- current source content hash drives re-index;
- no duplicate active provider document for one current source;
- update supersedes/replaces provider-derived document without changing source identity;
- Inactive excludes/removes normal retrieval;
- Reactivate restores latest content;
- exact provider document may be deleted/rebuilt without changing Drive source;
- provider failure does not roll back Meeting/Pitchbook save.

No recurring trigger. Use bounded private/direct sync/qualification handlers only.

## 10. Settings/config

Support provider-specific server-side configuration aligned with repository conventions, including equivalents of:

```text
OPENAI_ENABLED
OPENAI_VECTOR_STORE_ID
OPENAI_DEFAULT_MODEL
GEMINI_ENABLED
GEMINI_FILE_SEARCH_STORE_NAME
GEMINI_DEFAULT_MODEL
AI_SYNC_ENABLED
```

Do not create provider Stores automatically in ordinary user traffic unless the accepted setup/qualification path explicitly does so.

Store secret credentials only in the existing secure server-side boundary.

## 11. Audit/redaction

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

Never store in Audit:

```text
question/additional instruction
answer
retrieved chunks
source body
full-output body
raw provider payload
credentials
embedding
uploaded bytes
private Store IDs
```

Do not expose secrets/private provider IDs through browser responses or generated export bodies.

## 12. Deterministic validation before any paid/live calls

At minimum add focused tests for:

- schema 5 -> 6 append-only/idempotent migration;
- legacy Gemini state -> provider state migration;
- independent OpenAI/Gemini state serialization;
- compact metadata projection and OpenAI <=16 attribute gate;
- provider selection/no failover;
- safe provider errors;
- OpenAI current request/response/citation mapping;
- Gemini current request/response/citation mapping;
- exact stable-source citation resolution;
- content-hash/idempotency/no duplicate active provider doc;
- true full-output package body;
- unsupported full-output format fails closed;
- package fingerprint parity Copy/Docs/PDF;
- button order and bottom internally-scrollable preview;
- no FULL_EXPORT provider call;
- Audit/secret redaction;
- public surface.

Then run focused suites, `npm run check`, temporal validator, public-surface validator, and `git diff --check`.

Do not start billing-enabled provider calls before deterministic PASS.

## 13. Target-runtime qualification

Use existing private/personal synthetic DEV only.

First positively identify the current Apps Script project/private Web App and verify current version `40` baseline before source sync.

After deterministic PASS:

1. sync exact tested source once;
2. exact source readback;
3. create exactly one immutable Apps Script version;
4. update the SAME existing private Web App in place; no new deployment or Library mutation;
5. execute schema 5 -> 6 migration/readback once;
6. confirm exactly five Backend sheets/schema 6;
7. confirm authoritative source rows/files/IDs preserved;
8. FULL_EXPORT with one Meeting + one fully extractable Pitchbook/source:
   - full body present for both;
   - summary/char count;
   - buttons above body;
   - body bottom/internal scroll;
   - Copy once;
   - one Docs artifact;
   - one PDF artifact;
   - exact package fingerprint/content parity;
   - zero AI provider call;
9. for each enabled provider:
   - read back config/capability without secret;
   - use/create exactly one isolated test Store as authorized;
   - index Meeting;
   - grounded query + stable citation/Drive mapping;
   - index first Pitchbook/source;
   - exact `entity_key` or `source_id` filter;
   - bounded source content update/reindex if an existing synthetic source can be safely modified, otherwise use a clearly bounded synthetic fixture path approved by the Work contract;
   - Inactivate -> retrieval excluded;
   - Reactivate -> retrieval restored;
   - exact provider-derived delete/rebuild;
   - no duplicate active document;
10. for any deliberately disabled provider:
    - select it once;
    - safe error;
    - zero call to other provider;
11. no recurring trigger;
12. final integrity and bounded cleanup/readback.

Do not use confidential/company production data.

## 14. Runtime result matrix

Report exactly:

```text
OPENAI_RUNTIME: PASS | DISABLED_BY_CONFIG | FAIL | NOT RUN
GEMINI_RUNTIME: PASS | DISABLED_BY_CONFIG | FAIL | NOT RUN
FULL_OUTPUT_RUNTIME: PASS | FAIL | NOT RUN
```

Overall Work may PASS when:

- FULL_OUTPUT_RUNTIME = PASS;
- at least one File Search provider = PASS;
- every provider enabled in this environment = PASS;
- every deliberately disabled provider safe-error/no-failover path = PASS;
- schema/provider state/final integrity = PASS.

A disabled provider is not claimed live-qualified.

## 15. Mutation/side-effect boundary

Allowed:

- append-only schema 6 migration;
- provider-derived state changes;
- bounded isolated provider Store/documents;
- bounded synthetic source lifecycle needed for provider qualification;
- one Google Doc + one PDF test export artifact;
- one in-place Web App version update after deterministic PASS.

Prohibited:

- company confidential data;
- company production Store;
- broad users/public access;
- recurring triggers;
- new Web App deployment;
- Library mutation;
- unauthorized source deletion;
- production rollout;
- GitHub/chat/log persistence of secrets/private IDs.

## 16. Strategy Reset

Reset instead of looping if:

- official provider API contradicts core Store/filter/citation assumptions;
- stable citation mapping is not deterministic;
- provider state cannot avoid duplicate active documents;
- full-output cannot truthfully include full first-slice source bodies;
- same live-provider failure remains after one materially different bounded repair;
- target Web App/deployment identity is ambiguous.

Preserve accepted evidence from unaffected routes.

## Delivery

Create:

`docs/handoffs/0020-CODEX-01-ai-provider-core-report.md`

Update:

- `docs/handoffs/0020-report.md`;
- `docs/handoffs/0020-instruction.md`;
- `docs/handoffs/0020-dispatches.md`;
- Draft PR body.

Commit and push all scoped changes. Keep PR Draft / Open / unmerged for ChatGPT final review.

Return:

- Work/Dispatch IDs;
- LOGIC_VALIDATION;
- TARGET_RUNTIME_QUALIFICATION;
- OPENAI_RUNTIME;
- GEMINI_RUNTIME;
- FULL_OUTPUT_RUNTIME;
- schema/provider-state result;
- package parity result;
- public facade count;
- Apps Script version;
- side-effect states;
- final integrity;
- report path;
- final commit;
- branch/PR;
- BLOCKER YES/NO.

On full PASS classify:

```text
DEV QUALIFIED — WORK 0020 AI PROVIDER CORE
LOGIC_VALIDATION: PASS
TARGET_RUNTIME_QUALIFICATION: PASS under enabled-provider matrix
FULL_OUTPUT_RUNTIME: PASS
READY: YES for personal-PC provider core
BLOCKER: NO
```
