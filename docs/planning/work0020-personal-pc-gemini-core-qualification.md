# Work 0020 — AI Provider Core, dual File Search, and Meeting full output

WORK_ID: `0020`

Status: Active after Work 0019

Mode: `BUILD / QUALIFICATION` with bounded repair allowed

Authoritative decision:

`docs/decisions/ai-provider-selection-and-full-output.md`

Provider-neutral architecture:

`docs/ai/provider-neutral-file-search.md`

## Primary outcome

Deliver and qualify one provider-neutral Knowledge Search core with exactly three user-facing routes:

```text
ChatGPT
Gemini
全文出力
```

- ChatGPT uses OpenAI File Search over Meeting + Pitchbook/source materials;
- Gemini uses Gemini File Search over Meeting + Pitchbook/source materials;
- 全文出力 calls no AI API and exports authoritative Meeting Google Docs text only, with optional Pitchbook reference links.

Do not split provider foundation, full-output UX, and first live File Search qualification into separate Works.

## Closed product boundary

The source scopes intentionally differ:

```text
ChatGPT / Gemini File Search
  -> Meeting + Pitchbook/source materials

全文出力
  -> Meeting Google Docs full text only
  -> optional matching Pitchbook reference list + Drive links
```

Pitchbook body/file text is not copied into FULL_EXPORT. The six-format expansion in Work 0021 applies to provider File Search, not manual full output.

## Current-API preflight

At Work start, verify current official OpenAI and Gemini documentation for File Search request/response shape, model support, Store identity, metadata filters, citation shape, supported core formats, pricing/retention/rate limits, and credential/project requirements.

Current preflight already establishes:

- OpenAI: Responses API `file_search` + Vector Stores + file attributes/filter + `file_citation`;
- OpenAI Vector Store file attributes are limited to 16, so provider metadata must be compact and stable-ID-first;
- Gemini: Interactions/File Search Store path with custom metadata/`metadata_filter` + file citations.

Existing repository request contracts are evidence, not presumed current truth.

## Target/runtime boundary

- current private Apps Script project and existing private Web App;
- personal Google environment only;
- synthetic/non-confidential Meeting and Pitchbook/source records;
- isolated OpenAI/Gemini test Stores where enabled;
- server-side credentials outside GitHub/browser/Audit/user-visible Sheets;
- bounded billing-enabled calls only;
- no company Shared Drive/confidential data/production users/recurring trigger.

## 1. Provider-neutral contracts

### Canonical AI Source

Reuse one authoritative source model for both Meeting and Pitchbook/source materials. Provider adapters must not rebuild identity or semantic metadata independently.

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

### Canonical Meeting Knowledge Package

FULL_EXPORT builds one deterministic package from matching Meeting Google Docs only.

The package includes:

```text
mode/instruction
filter/scope summary
Meeting full-text count
Meeting character count
Meeting stable IDs/metadata/Drive links
Meeting Google Docs body text
optional reference Pitchbook metadata/Drive links
package fingerprint
```

Pitchbook body/file text is intentionally excluded.

Copy / Google Docs / PDF must consume exactly this same package/fingerprint.

### Normalized result/citation

OpenAI/Gemini normalize to one UI contract:

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

Citation authority is stable `source_id`, not provider filename alone.

## 2. Explicit route selection

UI displays exactly:

```text
ChatGPT | Gemini | 全文出力
```

No Auto and no cross-provider failover.

- OpenAI unavailable/disabled -> ChatGPT-specific safe error and zero Gemini call;
- Gemini unavailable/disabled -> Gemini-specific safe error and zero OpenAI call;
- model names remain admin settings.

## 3. Provider adapters

Private equivalent adapters for `OPENAI` and `GEMINI` own only provider-specific capability/config readback, Store create/read, source upsert/remove, polling, metadata-filter translation, grounded query, citation normalization, retry/error classification, and cleanup/rebuild.

Both adapters must support Meeting and Pitchbook/source indexing in the core slice.

## 4. Independent provider state / schema

OpenAI and Gemini derived states must be independently stored/read.

Work 0020 increments schema exactly once:

```text
5 -> 6
```

Append `AI_Provider_State_JSON` to both `Meeting_Index` and `Pitchbook_Index`. Keep exactly five Backend sheets.

Preferred provider-state object keyed by `OPENAI` and `GEMINI` contains provider document/store reference, `NotIndexed / Pending / Indexed / Failed`, indexed_at, content_hash, and safe last error.

When the new state is blank, migrate compatible existing legacy Gemini-oriented AI state into `GEMINI` only. Preserve legacy `AI_*` fields; no destructive rewrite.

## 5. Compact provider metadata

OpenAI metadata projection must remain within the current 16-attribute file limit.

Use stable-ID-first fields such as:

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

Do not spend provider metadata slots on display names, Drive URLs, filenames, content hashes, or duplicate human-readable labels. Resolve those from Backend after citation using stable source ID.

## 6. Full-output UX

When `全文出力` is selected:

1. resolve matching authoritative Meetings;
2. independently resolve matching Pitchbooks only for optional reference listing;
3. show Meeting full-text count and Meeting character count;
4. show reference Pitchbook count separately when nonzero;
5. place buttons above body: `コピー / Google Docs / PDF`;
6. show status/error immediately below buttons;
7. place Meeting full-text preview at the bottom;
8. use fixed/bounded height + internal scrolling;
9. users may export without inspecting the body;
10. Copy/Docs/PDF use identical package string/fingerprint;
11. no popup/modal;
12. zero OpenAI/Gemini API call;
13. do not read Pitchbook bytes or extract Pitchbook text for FULL_EXPORT.

Helper text should explicitly say that Pitchbook body is not included and matching Pitchbooks are references only.

## 7. Shortest File Search qualification slice

Use exactly one existing/synthetic Meeting and one synthetic/non-confidential Pitchbook/source first.

For every enabled provider:

1. capability/config + isolated Store identity readback;
2. index the Meeting;
3. grounded query + stable citation -> authoritative Drive link;
4. index the Pitchbook/source;
5. query that requires/cites the Pitchbook so Pitchbook retrieval is directly proven;
6. one exact stable metadata filter (`entity_key` or `source_id`);
7. update/reindex one synthetic source without duplicate active document;
8. Inactive exclusion;
9. Reactivate restoration;
10. exact delete/rebuild of derived provider document;
11. latency/polling/retry/rate-limit/cost/retention evidence.

For a deliberately disabled provider, select it once, prove provider-specific safe error, prove zero call to the other provider, and report `DISABLED_BY_CONFIG` rather than live PASS.

## 8. Full-output qualification slice

Use Meeting Google Docs text only.

1. select a bounded scope containing at least one Meeting;
2. generate the canonical Meeting package once;
3. verify Meeting count/character count/scope summary;
4. if matching Pitchbooks exist, verify they appear only as references/links and do not contribute file text to the body;
5. verify buttons above preview;
6. verify preview is bottom + internally scrollable;
7. Copy once;
8. create one Google Doc;
9. create one PDF;
10. verify package fingerprint/text parity across all three outputs;
11. verify zero AI provider call;
12. clean up only explicitly authorized test export artifacts.

## 9. Indexing lifecycle

For each provider and for both Meeting/Pitchbook derived sources:

- authoritative save succeeds first;
- provider state Pending -> Indexed/Failed;
- AI failure never rolls back source capture;
- content hash controls re-index;
- no duplicate active provider document per source;
- Inactive excludes/removes normal retrieval;
- Reactivate indexes latest content;
- exact delete/rebuild never changes authoritative Drive source.

## 10. Audit and redaction

Allowed bounded Audit metadata includes route/provider, mode, structured filter IDs, configured model alias, result, cited stable source IDs, safe error code/message.

Do not store questions, generated answers, retrieved chunks, source bodies, full-output body, raw provider payloads, credentials, embeddings, uploaded bytes, or private Store identifiers.

## 11. Logic validation

Before billing-enabled calls, prove:

- schema 5->6 migration and idempotency;
- provider-state parser/serializer + legacy Gemini migration;
- OpenAI/Gemini independent state;
- OpenAI metadata budget <=16;
- explicit route selection/no failover/safe errors;
- current OpenAI/Gemini request/response mappings;
- stable citation resolution for Meeting and Pitchbook;
- retry/idempotency/content hash/no duplicate provider docs;
- FULL_EXPORT Meeting-only body contract;
- Pitchbook reference-only behavior;
- Copy/Docs/PDF package parity;
- buttons above body + bottom internal-scroll preview;
- zero provider call from FULL_EXPORT;
- Audit/secret redaction;
- public surface;
- temporal validator;
- `npm run check` and `git diff --check`.

Do not begin live paid provider calls before deterministic PASS.

## 12. Target-runtime qualification and completion

Verify exact current Apps Script/private Web App identity/version `40` first. Then sync exact tested source once, exact source readback, create one immutable Apps Script version, update the same private Web App in place, execute schema 5->6, and confirm five sheets/schema 6.

Report separately:

```text
OPENAI_RUNTIME: PASS | DISABLED_BY_CONFIG | FAIL | NOT RUN
GEMINI_RUNTIME: PASS | DISABLED_BY_CONFIG | FAIL | NOT RUN
FULL_OUTPUT_RUNTIME: PASS | FAIL | NOT RUN
```

Overall completion requires:

- provider-neutral core and migration PASS;
- FULL_OUTPUT_RUNTIME PASS using Meeting Google Docs text;
- at least one File Search provider live PASS;
- every enabled provider live PASS;
- every disabled provider safe-error/no-failover PASS;
- File Search proof includes both Meeting and Pitchbook/source retrieval/citation;
- final source/Index/Store/Audit/credential/trigger integrity PASS;
- no company production-readiness claim.

## 13. Side effects

Expected:

```text
APPLICATION_DATA_SIDE_EFFECT_STATE: GUARDED only for append-only provider-state migration
PROVIDER_STORE_SIDE_EFFECT_STATE: TEST_ONLY
EXPORT_ARTIFACT_SIDE_EFFECT_STATE: TEST_ONLY
DEPLOYMENT_SIDE_EFFECT_STATE: GUARDED
```

No recurring trigger, confidential data, production Store, broad user access, new Web App deployment, Library mutation, or unauthorized authoritative source deletion.

## 14. Non-goals

- advanced full filter matrix;
- all five modes end-to-end on every format;
- 2–5 entity comparison;
- all six Pitchbook/source formats in the first core slice;
- automatic provider selection/failover;
- user-facing model selector;
- full-context API route replacing File Search;
- custom Vector DB/embedding service;
- Pitchbook body extraction for FULL_EXPORT;
- company production rollout.

## Completion latch

```text
DEV QUALIFIED — WORK 0020 AI PROVIDER CORE
LOGIC_VALIDATION: PASS
TARGET_RUNTIME_QUALIFICATION: PASS under enabled-provider matrix
FULL_OUTPUT_RUNTIME: PASS
READY: YES for personal-PC provider core
BLOCKER: NO
```
